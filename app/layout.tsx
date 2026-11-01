import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { getSiteSettings } from "@/services/content";
import { siteUrl } from "@/lib/defaults";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-inter-tight", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.seo.defaultTitle || s.siteName;
  const description = s.seo.defaultDescription || s.tagline || undefined;
  const og = s.seo.ogImage?.url;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: s.seo.titleTemplate || `%s — ${s.siteName}` },
    description,
    keywords: s.seo.keywords?.length ? s.seo.keywords : undefined,
    applicationName: s.siteName,
    authors: [{ name: s.siteName }],
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: s.siteName,
      title,
      description,
      url: "/",
      locale: "en_GB",
      images: og ? [{ url: og, width: s.seo.ogImage?.width, height: s.seo.ogImage?.height }] : undefined,
    },
    twitter: {
      card: og ? "summary_large_image" : "summary",
      title,
      description,
      creator: s.seo.twitterHandle || undefined,
      images: og ? [og] : undefined,
    },
    icons: s.favicon?.url ? { icon: s.favicon.url, apple: s.favicon.url } : undefined,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0c0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
