import { z } from "zod";
import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, phoneNumber } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { type Database, schema } from "@10in/db";

export const authEnvironmentSchema = z.object({
  AUTH_SECRET: z.string().min(32),
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export interface AuthOptions {
  db: Database;
  secret: string;
  baseURL?: string;
  sendPhoneOtp: (phoneNumber: string, code: string) => Promise<void>;
}

export interface AuthInstance { handler(request: Request): Promise<Response> }

/** BetterAuth 1.6.23 factory; transport-specific OTP delivery remains injected. */
export function createAuth(options: AuthOptions): AuthInstance {
  return betterAuth({
    secret: options.secret,
    ...(options.baseURL === undefined ? {} : { baseURL: options.baseURL }),
    database: drizzleAdapter(options.db, { provider: "sqlite", schema }),
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
      phoneNumber({ sendOTP: ({ phoneNumber: number, code }) => options.sendPhoneOtp(number, code) }),
    ],
  });
}
