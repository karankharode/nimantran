"use client";

import { TrpcProvider } from "@/lib/trpc/react";
import { BrandProvider } from "./BrandProvider";
import { ThemeProvider } from "./ThemeProvider";

/** Single client-provider tree mounted once in the root layout. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <BrandProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </BrandProvider>
    </TrpcProvider>
  );
}
