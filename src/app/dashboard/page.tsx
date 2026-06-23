import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/server/auth";
import { brand } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Empty authenticated dashboard (Phase 0 exit criterion). Server-side auth gate:
 * unauthenticated users are sent to /login. The real Overview/Guests/Wishes tabs
 * arrive in Phase 4.
 */
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-dvh bg-chrome-bg text-chrome-text">
      <header className="flex items-center justify-between border-b border-chrome-border px-6 py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="text-sm text-chrome-muted">{session.user.phone}</span>
          <SignOutButton />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
          Welcome to {brand.name}
        </h1>
        <p className="mt-2 text-chrome-muted">
          You&apos;re signed in. Your invitations will live here.
        </p>

        <Card className="mt-8 flex flex-col items-center gap-4 py-14 text-center">
          <p className="font-display text-xl text-chrome-text">No invitations yet</p>
          <p className="max-w-sm text-sm text-chrome-muted">
            Start from your invitation card with AI, or pick a template. The builder
            ships in Phase 1.
          </p>
          <div className="flex gap-3">
            <Button disabled title="Available in Phase 1">
              Create with AI
            </Button>
            <Button variant="secondary" disabled title="Available in Phase 1">
              Browse templates
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
