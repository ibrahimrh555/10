import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { authEnvironmentSchema, createAuth } from "@10in/auth";
import { createDatabase } from "@10in/db";
import { adminRouter } from "@10in/api-admin";
import { createRouter, createTRPCContext } from "@10in/api-core";
import { gamesRouter } from "@10in/api-games";
import { socialRouter } from "@10in/api-social";
import { citiesRouter, notificationsOnboardingRouter, onboardingUserRouter } from "./onboarding";
import { extractSingleImage, type ProfilePhotoStorage, uploadProfilePhoto } from "./profile-photo";

export interface ApiBindings { NODE_ENV: string; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string; OTP_PROVIDER: string; RESEND_API_KEY?: string; OTP_FROM_EMAIL?: string; DATABASE_URL: string; DATABASE_AUTH_TOKEN?: string; MOBILE_APP_ORIGIN: string; PROFILE_PHOTOS: ProfilePhotoStorage; R2_PUBLIC_URL: string; ONESIGNAL_APP_ID?: string; ONESIGNAL_REST_API_KEY?: string }
type ApiEnvironment = { Bindings: ApiBindings };
const runtime = (bindings: ApiBindings, defer?: (promise: Promise<void>) => void) => {
  const environment = authEnvironmentSchema.parse(bindings);
  const database = createDatabase({ url: bindings.DATABASE_URL, ...(bindings.DATABASE_AUTH_TOKEN ? { authToken: bindings.DATABASE_AUTH_TOKEN } : {}) });
  return { ...database, auth: createAuth({ db: database.db, environment, ...(defer ? { defer } : {}) }) };
};

export const appRouter = createRouter({
  admin: adminRouter,
  games: gamesRouter,
  social: socialRouter,
  cities: citiesRouter,
  notifications: notificationsOnboardingRouter,
  user: onboardingUserRouter,
});

export type AppRouter = typeof appRouter;

const app = new Hono<ApiEnvironment>();

app.use("*", async (context, next) => cors({ origin: context.env.MOBILE_APP_ORIGIN, credentials: true, allowHeaders: ["Content-Type", "Authorization"], allowMethods: ["GET", "POST", "OPTIONS"] })(context, next));

app.get("/health", (context) => context.json({ status: "ok" }));

app.all("/api/auth/*", async (context) => {
  const { auth, client } = runtime(context.env, promise => context.executionCtx.waitUntil(promise));
  try { return await auth.handler(context.req.raw); } finally { client.close(); }
});

app.post("/api/assets/profile-photo", async context => {
  const { auth, client, db } = runtime(context.env, promise => context.executionCtx.waitUntil(promise));
  try {
    const session = await auth.getSession(context.req.raw.headers);
    if (!session) throw new HTTPException(401, { message: "Authentification requise" });
    const contentType = context.req.header("content-type") ?? "";
    if (!contentType.toLocaleLowerCase().startsWith("multipart/form-data;")) throw new HTTPException(400, { message: "Une requête multipart/form-data est requise" });
    const form = await context.req.formData().catch(() => { throw new HTTPException(400, { message: "Corps multipart invalide" }); });
    const result = await uploadProfilePhoto({ db, storage: context.env.PROFILE_PHOTOS, publicUrl: context.env.R2_PUBLIC_URL, userId: session.user.id, file: extractSingleImage(form) });
    return context.json(result);
  } finally {
    client.close();
  }
});

app.all("/trpc/*", async (context) => {
  const { auth, client, db } = runtime(context.env, promise => context.executionCtx.waitUntil(promise));
  try { return await fetchRequestHandler({
    endpoint: "/trpc",
    req: context.req.raw,
    router: appRouter,
    createContext: async () => createTRPCContext(context.req.raw, db, await auth.getSession(context.req.raw.headers)),
  }); } finally { client.close(); }
});

app.onError((error, context) => {
  if (error instanceof HTTPException) return error.getResponse();
  console.error(JSON.stringify({ event: "request_failed", path: context.req.path, message: error.message }));
  return context.json({ error: "Une erreur interne est survenue", ...(context.env.NODE_ENV === "development" ? { detail: error.message } : {}) }, 500);
});

export default app;
