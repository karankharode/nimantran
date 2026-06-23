import { brand } from "@/config/brand";

/**
 * Brand wordmark. Reads the name from brand.ts so a rebrand needs no component
 * change. Uses the Devanagari lockup as a gold accent diamond.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{ fontFamily: "var(--font-display)" }}
      aria-label={brand.name}
    >
      <span className="text-gold">◆</span>{" "}
      <span className="align-middle text-[1.35rem] tracking-wide">{brand.name}</span>
    </span>
  );
}
