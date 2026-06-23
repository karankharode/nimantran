"use client";

import { createContext, useContext } from "react";
import { brand, type Brand } from "@/config/brand";

/**
 * Exposes the single brand config to client components. Components read brand
 * strings/colors from here (or import `brand` directly in server components) —
 * never hardcode the product name, colors, or domain (doc 00 §2).
 */
const BrandContext = createContext<Brand>(brand);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}
