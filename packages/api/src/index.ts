import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Hono } from "hono";
import { adminRouter } from "@10in/api-admin";
import { createRouter, createTRPCContext } from "@10in/api-core";
import { gamesRouter } from "@10in/api-games";
import { socialRouter } from "@10in/api-social";

export const appRouter = createRouter({
  admin: adminRouter,
  games: gamesRouter,
  social: socialRouter,
});

export type AppRouter = typeof appRouter;

const app = new Hono();

app.get("/health", (context) => context.json({ status: "ok" }));

app.all("/trpc/*", (context) =>
  fetchRequestHandler({
    endpoint: "/trpc",
    req: context.req.raw,
    router: appRouter,
    createContext: () => createTRPCContext(context.req.raw),
  }),
);

export default app;
