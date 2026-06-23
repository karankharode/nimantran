# 06 — Template Engine (the most important rebuild decision)

Each template is a **self-contained plugin**. Adding/removing templates never touches core code. The **same renderer** drives the builder preview and the published invite.

---

## 1. Anatomy of a template plugin

```
src/templates/<id>/
  config.ts        metadata: name, faith, region, palette, price, motifs, fonts, audio
  schema.ts        which sections/fields it supports + defaults (Zod)
  Renderer.tsx     React tree consuming the invitation document → the visual
  interactions/    signature animation (lazy-loaded): dhol / kolam / jharokha /
                   houseboat / vintage-car / petal-shower ...
  assets/          vectors, textures, audio (served from R2/CDN in prod)
  index.ts         barrel → registers into the registry
```

### config.ts (contract)
```ts
export const config: TemplateConfig = {
  id: "punjabi-virsa",
  name: "Punjabi Virsa",
  faith: "sikh", region: "punjab",
  basePrice: 3999, price: 1999,
  palette: { bg:"#1a0f0a", primary:"#d4762a", accent:"#f2c14e", text:"#fff5e6" },
  fonts: { display:"'Yatra One', serif", ui:"'Inter'" },
  motifs: ["phulkari","marigold"],
  audio: { default: "bhangra-dhol" },
  interaction: () => import("./interactions/dhol-curtain"),  // lazy
  supports: ["essentials","invitation","events","story","gallery","info","gifts","rsvp","calendar","music"],
};
```

### schema.ts
Defines the template's field set + tasteful defaults (e.g. default event descriptions, default info cards). The builder **auto-generates its form** from this schema, so a new template's form appears with zero builder code changes. Validated by Zod; merges over the base invitation schema.

### Renderer.tsx
A **pure function of the invitation document**: `(<Renderer invitation={doc} theme={config.palette} mode="preview"|"live" />)`. No data fetching inside. This guarantees preview == published.

---

## 2. The registry

```ts
// src/templates/registry.ts
import * as imperialHeritage from "./imperial-heritage";
import * as punjabiVirsa from "./punjabi-virsa";
// ...8 themed + custom
export const templates = {
  "imperial-heritage": imperialHeritage,
  "punjabi-virsa": punjabiVirsa,
  // ...
} as const;
export type TemplateId = keyof typeof templates;
export const getTemplate = (id: TemplateId) => templates[id];
export const listTemplates = () => Object.values(templates).map(t => t.config);
```

Pricing/availability is overlaid from the `Template` DB table (doc 02) at runtime, so prices change without redeploy; the code defines look + behavior.

---

## 3. Theming pipeline (no drift)

```
brand.theme (brand.ts)  ─┐
                          ├─►  ThemeProvider sets CSS vars  ─►  Renderer + Builder chrome
template.config.palette ─┘     (--bg,--primary,--accent,...)
invitation.themeSettings ─────►  per-invite overrides (top layer)
```
Both the live preview (builder) and the published page consume the **same CSS variables** produced by the same `ThemeProvider`. One source of truth.

---

## 4. The 8 themed templates + Custom (port from ShaadiOra)

| id | name | faith/region | signature interaction |
|---|---|---|---|
| `imperial-heritage` | Imperial Heritage | all · royal maroon/gold | regal crimson + peacock-gold borders |
| `punjabi-virsa` | Punjabi Virsa | punjab | pull-the-dhol curtain, marigold petal shower, bhangra |
| `muggu-vaakili` | Muggu Vaakili | TN/AP | trace kolam to break dawn; diya travels rice line |
| `paithani-mor` | Paithani Mor | maharashtra | play dhol to enter; gulal burst on tap |
| `mewar-jharokha` | Mewar Jharokha | rajasthan | slide jharokha shutters; jhoomer; fireworks finale |
| `vintage-ride` | Vintage Ride | all | scroll drives vintage convertible to invite deck |
| `kerala-backwaters` | Kerala Backwaters | kerala | houseboat drift; light nilavilakku; part kasavu |
| `premium-custom` | Premium Custom | all | team-authored bespoke config |

Custom = a bespoke `config`/`Renderer` the design team authors per client; same plugin contract, higher price, high-touch onboarding.

---

## 5. Performance rules
- `interaction` and heavy assets are **lazy-loaded** (dynamic import) — guest invite ships minimal JS, hydrates the cinematic layer after first paint.
- `prefers-reduced-motion` swaps interactions for a tasteful static reveal.
- Audio is user-initiated (tap the floating widget) — never autoplay.
- Renderer is RSC-friendly where possible; interactive bits are client islands.

---

## 6. Adding a new template (the test of the design)
1. `mkdir src/templates/<id>` with the 5 files above.
2. Add to `registry.ts`.
3. Insert a `Template` DB row (price/availability).
Done — it appears in `/templates`, the builder form adapts to its schema, and it renders identically in preview and live. No core changes.
