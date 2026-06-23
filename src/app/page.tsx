import Link from "next/link";
import { brand } from "@/config/brand";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

/**
 * Landing placeholder for Phase 0. The full marketing site (hero, journey,
 * report promo, templates strip, testimonials) is built in Phase 7.
 */
export default function HomePage() {
  return (
    <main className="min-h-dvh bg-bg text-text">
      <nav className="flex items-center justify-between px-6 py-5">
        <Logo />
        <Link href="/login">
          <Button variant="secondary" size="sm">
            Login
          </Button>
        </Link>
      </nav>

      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <p className="mb-4 font-display text-2xl text-gold">{brand.nameDevanagari}</p>
        <h1
          className="text-balance text-4xl leading-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {brand.tagline}
        </h1>
        <p className="mt-5 max-w-md text-muted">{brand.shortPitch}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login">
            <Button size="lg">Create with AI ▸</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Browse Templates
            </Button>
          </Link>
        </div>
        <p className="mt-16 text-xs text-muted/70">
          Phase 0 foundations — marketing site lands in Phase 7.
        </p>
      </section>
    </main>
  );
}
