import type { ComponentType } from "react";

/** Per-template palette → mapped to CSS variables by ThemeProvider. */
export interface TemplatePalette {
  bg: string;
  surface?: string;
  primary: string;
  accent: string;
  text: string;
  muted?: string;
}

export type SectionKey =
  | "essentials" | "invitation" | "events" | "story" | "gallery"
  | "info" | "gifts" | "rsvp" | "calendar" | "music";

export interface TemplateConfig {
  id: string;
  name: string;
  faith?: string;   // hindu|muslim|christian|sikh|buddhist|jain|parsi|all
  region?: string;  // maharashtra|punjab|rajasthan|south|kerala|bengali|gujarati|ne|all
  basePrice: number; // struck-through original (INR)
  price: number;     // current (INR) — overlaid by Template DB row at runtime
  isCustom?: boolean;
  palette: TemplatePalette;
  fonts: { display: string; ui: string };
  motifs: string[];
  audio?: { default?: string };
  /** lazy-loaded signature interaction module */
  interaction?: () => Promise<unknown>;
  /** which builder sections this template supports */
  supports: SectionKey[];
}

/** The normalized invitation document the renderer consumes (see docs/02). */
export interface InvitationDocument {
  content: Record<string, unknown>;
  events: unknown[];
  story?: unknown;
  gallery?: unknown[];
  infoCards?: unknown[];
  gifts?: unknown;
  rsvp?: unknown;
  music?: unknown;
  sectionsEnabled: Record<SectionKey, boolean>;
}

export interface RendererProps {
  invitation: InvitationDocument;
  palette: TemplatePalette;
  mode: "preview" | "live";
}

export interface TemplateModule {
  config: TemplateConfig;
  Renderer: ComponentType<RendererProps>;
  /** Zod schema (imported lazily to keep this file framework-light). */
  schema?: unknown;
}
