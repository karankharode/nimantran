/**
 * brand.ts — THE single source of truth for product branding.
 * Rebranding the entire product = editing this one file (and /public/brand/* assets).
 * Components, emails, metadata, and the PWA manifest must read from `brand`,
 * never hardcode the product name, colors, or domain.
 */
export const brand = {
  name: "Nimantran",
  legalName: "Nimantran Technologies",
  nameDevanagari: "निमंत्रण",
  tagline: "An Invitation They'll Never Forget",
  shortPitch: "Upload your card — we'll build the rest.",

  // env-driven so staging / prod / white-label differ without code changes
  domain: process.env.NEXT_PUBLIC_BRAND_DOMAIN ?? "nimantran.app",
  inviteUrl: (slug: string) =>
    `${process.env.NEXT_PUBLIC_BRAND_DOMAIN ?? "nimantran.app"}/${slug}`,

  email: {
    support: "help@nimantran.app",
    noreply: "no-reply@nimantran.app",
  },
  social: {
    instagram: "",
    youtube: "",
    whatsapp: "", // E.164 support number for the floating help button
  },

  // brand-level visual tokens. Per-template palettes live in template configs
  // (see docs/06-template-engine.md) and override these via CSS variables.
  theme: {
    colorBg: "#0a0a0a",
    colorSurface: "#14110d",
    colorGold: "#c9a24b",
    colorGoldDim: "#8a6f33",
    colorMaroon: "#7a1f2b",
    colorText: "#f3ece0",
    colorMuted: "#b9ad97",
    fontDisplay: "'Cormorant Garamond', serif",
    fontUI: "'Inter', sans-serif",
  },

  assets: {
    logo: "/brand/logo.svg",
    monogram: "/brand/monogram.svg",
    ogImage: "/brand/og.png",
    favicon: "/brand/favicon.ico",
  },
} as const;

export type Brand = typeof brand;
