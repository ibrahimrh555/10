import { initTRPC } from "@trpc/server";

export interface TRPCContext {
  request: Request;
}

const trpc = initTRPC.context<TRPCContext>().create();

export const createTRPCContext = (request: Request): TRPCContext => ({ request });
export const createRouter = trpc.router;
export const publicProcedure = trpc.procedure;
