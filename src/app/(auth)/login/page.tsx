"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { trpc } from "@/lib/trpc/react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: (res) => {
      setStep("code");
      setError(null);
      if (res.devCode) {
        setDevCode(res.devCode);
        setCode(res.devCode);
      }
    },
    onError: (e) => setError(e.message),
  });

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError(null);
    const res = await signIn("phone-otp", { phone, code, redirect: false });
    setVerifying(false);
    if (res?.error) {
      setError("That code didn't match. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-text">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="bg-surface">
          {step === "phone" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                requestOtp.mutate({ phone });
              }}
            >
              <h1 className="mb-1 text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Sign in
              </h1>
              <p className="mb-5 text-sm text-muted">
                We&apos;ll text you a one-time code.
              </p>
              <Input
                label="Phone number"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error ?? undefined}
                required
              />
              <Button
                type="submit"
                size="lg"
                className="mt-5 w-full"
                disabled={requestOtp.isPending || phone.length < 8}
              >
                {requestOtp.isPending ? "Sending…" : "Send code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <h1 className="mb-1 text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Enter code
              </h1>
              <p className="mb-5 text-sm text-muted">
                Sent to <span className="text-text">{phone}</span>.{" "}
                <button
                  type="button"
                  className="text-gold underline"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setDevCode(null);
                    setError(null);
                  }}
                >
                  Change
                </button>
              </p>
              {devCode && (
                <p className="mb-3 rounded-md bg-gold/10 px-3 py-2 text-xs text-gold">
                  Dev mode: your code is <strong>{devCode}</strong> (no SMS gateway
                  configured).
                </p>
              )}
              <Input
                label="6-digit code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="------"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                error={error ?? undefined}
                required
              />
              <Button
                type="submit"
                size="lg"
                className="mt-5 w-full"
                disabled={verifying || code.length !== 6}
              >
                {verifying ? "Verifying…" : "Verify & continue"}
              </Button>
            </form>
          )}
        </Card>
        <p className="mt-6 text-center text-xs text-muted">
          <Link href="/" className="hover:text-gold">
            ← Back home
          </Link>
        </p>
      </div>
    </main>
  );
}
