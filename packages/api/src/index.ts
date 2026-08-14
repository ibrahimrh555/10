import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { authEnvironmentSchema, createAuth } from "@10in/auth";
import { createDatabase } from "@10in/db";
import { adminRouter } from "@10in/api-admin";
import { createRouter, createTRPCContext } from "@10in/api-core";
import { gamesRouter } from "@10in/api-games";
import { socialRouter } from "@10in/api-social";
import { citiesRouter, onboardingUserRouter } from "./onboarding";

export interface ApiBindings { NODE_ENV: string; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string; OTP_PROVIDER: string; RESEND_API_KEY?: string; OTP_FROM_EMAIL?: string; DATABASE_URL: string; DATABASE_AUTH_TOKEN?: string; MOBILE_APP_ORIGIN: string }
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

app.all("/trpc/*", async (context) => {
  const { auth, client, db } = runtime(context.env, promise => context.executionCtx.waitUntil(promise));
  try { return await fetchRequestHandler({
    endpoint: "/trpc",
    req: context.req.raw,
    router: appRouter,
    createContext: async () => createTRPCContext(context.req.raw, db, await auth.getSession(context.req.raw.headers)),
  }); } finally { client.close(); }
});

app.onError((error, context) => { console.error(JSON.stringify({ event: "request_failed", path: context.req.path, message: error.message })); return context.json({ error: "Une erreur interne est survenue" }, 500); });

export default app;
