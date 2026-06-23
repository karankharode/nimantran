import { Inngest } from "inngest";
import { brand } from "@/config/brand";

/**
 * Inngest client (doc 01). Background jobs — AI draft, card OCR, PDF export,
 * WhatsApp sends, image processing — register against this client in later
 * phases. The app id is brand-derived so white-label deployments stay separate.
 */
export const inngest = new Inngest({
  id: brand.name.toLowerCase().replace(/\s+/g, "-"),
});

/** Registered Inngest functions. Populated as Phase 3/6 jobs land. */
export const inngestFunctions = [];
