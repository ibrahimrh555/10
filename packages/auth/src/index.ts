import { z } from "zod";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { type Database, schema, verification } from "@10in/db";
import { eq } from "drizzle-orm";
import { DevelopmentEmailOtpProvider, type EmailOtpProvider, ResendEmailOtpProvider } from "./providers";

export * from "./providers";

export const authEnvironmentSchema = z.object({ NODE_ENV: z.enum(["development", "test", "production"]).default("development"), BETTER_AUTH_SECRET: z.string().min(32), BETTER_AUTH_URL: z.url(), OTP_PROVIDER: z.enum(["development", "resend"]), RESEND_API_KEY: z.string().optional(), OTP_FROM_EMAIL: z.email().optional() }).superRefine((env, ctx) => {
  if (env.NODE_ENV === "production" && env.OTP_PROVIDER === "development") ctx.addIssue({ code: "custom", path: ["OTP_PROVIDER"], message: "development provider is forbidden in production" });
  if (env.OTP_PROVIDER === "resend" && !env.RESEND_API_KEY) ctx.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "required for Resend" });
  if (env.OTP_PROVIDER === "resend" && !env.OTP_FROM_EMAIL) ctx.addIssue({ code: "custom", path: ["OTP_FROM_EMAIL"], message: "required for Resend" });
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export function createEmailOtpProvider(env: AuthEnvironment): EmailOtpProvider { return env.OTP_PROVIDER === "development" ? new DevelopmentEmailOtpProvider(env.NODE_ENV) : new ResendEmailOtpProvider(env.RESEND_API_KEY ?? "", env.OTP_FROM_EMAIL ?? ""); }

export interface AuthSession { session: { id: string; userId: string; token: string; expiresAt: Date }; user: { id: string; email: string; name: string; cityId?: string | null; onboardingCompleted?: boolean; profilePhotoStepCompleted?: boolean; notificationPermissionAsked?: boolean } }
export interface AuthOptions { db: Database; environment: AuthEnvironment; provider?: EmailOtpProvider; defer?: (promise: Promise<void>) => void }

async function normalizeEmailRequest(request: Request, db: Database): Promise<Request | Response> {
  const path = new URL(request.url).pathname;
  if (request.method !== "POST" || (!path.endsWith("/email-otp/send-verification-otp") && !path.endsWith("/sign-in/email-otp"))) return request;
  const body: unknown = await request.clone().json().catch(() => null);
  if (!body || typeof body !== "object" || !("email" in body) || typeof body.email !== "string") return request;
  const email = body.email.trim().toLowerCase();
  if (path.endsWith("/email-otp/send-verification-otp")) {
    const recent = (await db.select({ createdAt: verification.createdAt }).from(verification).where(eq(verification.identifier, `sign-in-otp-${email}`)).limit(1))[0];
    if (recent && Date.now() - recent.createdAt.getTime() < 60_000) return Response.json({ message: "Veuillez patienter avant de demander un nouveau code" }, { status: 429 });
  }
  return new Request(request, { body: JSON.stringify({ ...body, email }) });
}

export interface AuthInstance { handler(request: Request): Promise<Response>; getSession(headers: Headers): Promise<AuthSession | null> }

/** BetterAuth 1.6.23 factory; transport-specific OTP delivery remains injected. */
export function createAuth(options: AuthOptions): AuthInstance {
  const provider = options.provider ?? createEmailOtpProvider(options.environment);
  const auth = betterAuth({
    secret: options.environment.BETTER_AUTH_SECRET,
    baseURL: options.environment.BETTER_AUTH_URL,
    database: drizzleAdapter(options.db, { provider: "sqlite", schema }),
    rateLimit: { enabled: true, window: 60, max: 100 },
    advanced: { useSecureCookies: options.environment.NODE_ENV === "production", defaultCookieAttributes: { httpOnly: true, secure: options.environment.NODE_ENV === "production", sameSite: "lax" } },
    user: {
      additionalFields: {
        dateOfBirth: { type: "date", required: false },
        cityId: { type: "string", required: false },
        profilePhotoStepCompleted: { type: "boolean", required: false, defaultValue: false },
        notificationPermissionAsked: { type: "boolean", required: false, defaultValue: false },
        onboardingCompleted: { type: "boolean", required: false, defaultValue: false },
        deletedAt: { type: "date", required: false },
      },
    },
    plugins: [
      admin({ defaultRole: "user", adminRoles: ["admin", "superadmin"], roles: { user: userAc, admin: adminAc, superadmin: adminAc } }),
      emailOTP({ otpLength: 6, expiresIn: 600, allowedAttempts: 5, storeOTP: "hashed", disableSignUp: false, resendStrategy: "rotate", rateLimit: { window: 60, max: 10 }, sendVerificationOTP: async ({ email, otp }) => { const delivery = provider.sendCode({ email: email.trim().toLowerCase(), code: otp, expiresInMinutes: 10 }); if (options.defer) { options.defer(delivery.catch((error: unknown) => { console.error(JSON.stringify({ event: "email_otp_delivery_failed", message: error instanceof Error ? error.message : "unknown" })); })); return; } await delivery; } }),
    ],
  });
  return { handler: async request => { const normalized = await normalizeEmailRequest(request, options.db); return normalized instanceof Response ? normalized : auth.handler(normalized); }, getSession: async (headers) => auth.api.getSession({ headers }) as Promise<AuthSession | null> };
}
