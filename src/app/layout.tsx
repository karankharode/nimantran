import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "@/styles/globals.css";
import { brand } from "@/config/brand";
import { Providers } from "@/components/providers/Providers";
import { Analytics } from "@/components/Analytics";

const fontUI = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui-loaded",
  display: "swap",
});
const fontDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.shortPitch,
  applicationName: brand.name,
  metadataBase: new URL(`https://${brand.domain}`),
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    siteName: brand.name,
    images: [brand.assets.ogImage],
  },
  icons: { icon: brand.assets.favicon },
};

export const viewport: Viewport = {
  themeColor: brand.theme.colorBg,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-chrome="dark"
      className={`${fontUI.variable} ${fontDisplay.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
