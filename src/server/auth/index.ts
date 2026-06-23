import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * The Auth.js singleton. `auth()` reads the session on the server (tRPC context,
 * server components, route handlers). `handlers` backs the /api/auth route.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
