import { initTRPC, TRPCError } from "@trpc/server";
import type { AuthSession } from "@10in/auth";
import type { Database } from "@10in/db";

export interface TRPCContext {
  request: Request;
  db: Database;
  session: AuthSession | null;
}

const trpc = initTRPC.context<TRPCContext>().create();

export const createTRPCContext = (request: Request, db: Database, session: AuthSession | null): TRPCContext => ({ request, db, session });
export const createRouter = trpc.router;
export const publicProcedure = trpc.procedure;
export const protectedProcedure = trpc.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
  return next({ ctx: { ...ctx, session: ctx.session } });
});
