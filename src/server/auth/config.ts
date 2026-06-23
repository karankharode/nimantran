import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { db } from "@/server/lib/db";
import { verifyOtp, normalizePhone } from "@/server/lib/otp";

/**
 * Auth.js (NextAuth v5) — phone-OTP via a Credentials provider. The client first
 * requests a code (tRPC `auth.requestOtp`), then signs in with { phone, code }.
 * `authorize` verifies the code and upserts the User. Sessions are JWT + httpOnly
 * cookie (doc 01). No password is ever stored.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code: { label: "Code", type: "text" },
      },
      authorize: async (raw) => {
        const phone = typeof raw?.phone === "string" ? raw.phone : "";
        const code = typeof raw?.code === "string" ? raw.code : "";
        if (!phone || !code) return null;

        const result = await verifyOtp(phone, code);
        if (!result.ok) return null;

        const normalized = normalizePhone(phone);
        const user = await db.user.upsert({
          where: { phone: normalized },
          update: {},
          create: { phone: normalized },
        });
        return { id: user.id, phone: user.phone, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.uid = user.id;
        // @ts-expect-error custom field carried from authorize()
        token.phone = user.phone;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.uid) {
        session.user.id = token.uid as string;
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },
  },
};
