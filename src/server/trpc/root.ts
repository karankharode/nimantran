import { createTRPCRouter, createCallerFactory } from "./trpc";
import { authRouter } from "./routers/auth";

/**
 * The root tRPC router. Feature routers (invitation, dash, intake, report,
 * templates) attach here as later phases land.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
