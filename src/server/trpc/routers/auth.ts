import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { requestOtp, isValidPhone, normalizePhone } from "@/server/lib/otp";

/**
 * Auth router. `requestOtp` issues a code (verification + sign-in happen via the
 * Auth.js Credentials provider on the client). `me` returns the current session
 * user for the dashboard shell.
 */
export const authRouter = createTRPCRouter({
  requestOtp: publicProcedure
    .input(z.object({ phone: z.string().min(8).max(20) }))
    .mutation(async ({ input }) => {
      const phone = normalizePhone(input.phone);
      if (!isValidPhone(phone)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_PHONE" });
      }
      const result = await requestOtp(phone);
      if (!result.ok && result.cooldown) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Please wait ${result.cooldown}s before requesting another code.`,
        });
      }
      // devCode is only present when no SMS gateway is configured (local dev).
      return { ok: true, phone, devCode: result.devCode ?? null };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, phone: true, name: true, email: true, createdAt: true },
    });
    return user;
  }),
});
