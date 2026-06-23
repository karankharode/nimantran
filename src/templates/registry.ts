/**
 * Template registry. Adding a template = create src/templates/<id>/ (config,
 * schema, Renderer, interactions, assets) and register it here. No core changes.
 * See docs/06-template-engine.md.
 */
import type { TemplateConfig, TemplateModule } from "./types";

// Each import is a self-contained plugin module: { config, Renderer, schema }.
// Stubbed here — implement under src/templates/<id>/index.ts during Phase 1/5.
// import * as imperialHeritage from "./imperial-heritage";
// import * as punjabiVirsa from "./punjabi-virsa";
// import * as mugguVaakili from "./muggu-vaakili";
// import * as paithaniMor from "./paithani-mor";
// import * as mewarJharokha from "./mewar-jharokha";
// import * as vintageRide from "./vintage-ride";
// import * as keralaBackwaters from "./kerala-backwaters";
// import * as premiumCustom from "./premium-custom";

export const templates: Record<string, TemplateModule> = {
  // "imperial-heritage": imperialHeritage,
  // "punjabi-virsa": punjabiVirsa,
  // ...
};

export type TemplateId = keyof typeof templates;

export function getTemplate(id: string): TemplateModule | undefined {
  return templates[id];
}

export function listTemplateConfigs(): TemplateConfig[] {
  return Object.values(templates).map((t) => t.config);
}

/** Catalog metadata for the 8 themed templates + Custom (port from ShaadiOra). */
export const PLANNED_TEMPLATES = [
  { id: "imperial-heritage", name: "Imperial Heritage", faith: "all", region: "all", basePrice: 1999, price: 1 },
  { id: "punjabi-virsa", name: "Punjabi Virsa", faith: "sikh", region: "punjab", basePrice: 3999, price: 1999 },
  { id: "muggu-vaakili", name: "Muggu Vaakili", faith: "hindu", region: "south", basePrice: 1999, price: 999 },
  { id: "paithani-mor", name: "Paithani Mor", faith: "hindu", region: "maharashtra", basePrice: 2999, price: 1499 },
  { id: "mewar-jharokha", name: "Mewar Jharokha", faith: "hindu", region: "rajasthan", basePrice: 5999, price: 2999 },
  { id: "vintage-ride", name: "Vintage Ride", faith: "all", region: "all", basePrice: 1999, price: 999 },
  { id: "kerala-backwaters", name: "Kerala Backwaters", faith: "all", region: "kerala", basePrice: 1999, price: 999 },
  { id: "premium-custom", name: "Premium Custom", faith: "all", region: "all", basePrice: 29999, price: 14999, isCustom: true },
] as const;
