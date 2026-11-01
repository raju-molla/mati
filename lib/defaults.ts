/**
 * Structural fallbacks used only when the database is empty or unreachable,
 * so the site never renders broken. Real content lives in MongoDB (see
 * `npm run seed` and the admin dashboard).
 */
import type { AboutData, HomepageData, HomepageSectionConfig, SiteSettingsData } from "@/types";

export const DEFAULT_SECTIONS: HomepageSectionConfig[] = [
  { key: "featuredWork", visible: true, eyebrow: "Selected work", heading: "Featured projects", intro: "" },
  { key: "disciplines", visible: true, eyebrow: "About", heading: "", intro: "" },
  { key: "photography", visible: true, eyebrow: "Through the lens", heading: "Photography", intro: "" },
  { key: "services", visible: true, eyebrow: "Services", heading: "How I can help", intro: "" },
  { key: "technical", visible: true, eyebrow: "Hands-on", heading: "Technical projects", intro: "" },
  { key: "experience", visible: true, eyebrow: "Experience", heading: "Where I've worked", intro: "" },
  { key: "cta", visible: true, eyebrow: "", heading: "Have a project in mind?", intro: "" },
];

export const DEFAULT_SITE: SiteSettingsData = {
  siteName: "Mateusz Tomaszek",
  brandName: "rateusz",
  tagline: "",
  logo: null,
  favicon: null,
  contactEmail: "",
  showEmailPublicly: false,
  location: "",
  availability: "",
  footerText: "",
  cvFile: null,
  cvLabel: "Download CV",
  social: { instagram: "", instagramHandle: "", linkedin: "", youtube: "", vimeo: "", tiktok: "", github: "" },
  seo: {
    defaultTitle: "Mateusz Tomaszek",
    titleTemplate: "%s — Mateusz Tomaszek",
    defaultDescription: "",
    keywords: [],
    ogImage: null,
    twitterHandle: "",
  },
  contactPage: { heading: "", intro: "", budgetOptions: [], successMessage: "" },
};

export const DEFAULT_HOME: HomepageData = {
  hero: {
    eyebrow: "",
    title: "Mateusz Tomaszek",
    subtitle: "",
    roles: [],
    description: "",
    mediaType: "gradient",
    image: null,
    video: null,
    showreelUrl: "",
    gradientFrom: "#14120f",
    gradientTo: "#2a2119",
    overlayOpacity: 55,
    primaryCtaLabel: "View My Work",
    primaryCtaHref: "/work",
    secondaryCtaLabel: "Contact Me",
    secondaryCtaHref: "/contact",
  },
  featuredProjects: [],
  technicalCategorySlug: "technical-projects",
  sections: DEFAULT_SECTIONS,
};

export const DEFAULT_ABOUT: AboutData = {
  eyebrow: "About",
  headline: "",
  intro: "",
  portrait: null,
  secondaryImage: null,
  focusAreas: [],
  previewText: "",
  openTo: [],
  seo: { title: "", description: "" },
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
