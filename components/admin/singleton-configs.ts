import type { FieldGroup } from "./fields/types";

export interface SingletonUIConfig {
  endpoint: "site" | "home" | "about";
  title: string;
  description: string;
  groups: FieldGroup[];
  previewPath?: string;
}

export const SINGLETON_CONFIGS: Record<string, SingletonUIConfig> = {
  homepage: {
    endpoint: "home",
    title: "Homepage",
    description: "Control the hero and which sections appear on the homepage, in what order.",
    previewPath: "/",
    groups: [
      {
        title: "Hero text",
        fields: [
          { name: "hero.eyebrow", label: "Small label above the name", type: "text", placeholder: "Portfolio — 2026" },
          { name: "hero.title", label: "Big title", type: "text", placeholder: "Mateusz Tomaszek" },
          { name: "hero.roles", label: "Rotating roles", type: "list", full: true, help: "Shown one at a time, e.g. Video Editor, Photographer." },
          { name: "hero.subtitle", label: "Line under the roles", type: "text", full: true },
          { name: "hero.description", label: "Short statement", type: "textarea", rows: 3, full: true },
        ],
      },
      {
        title: "Hero background",
        description: "Choose what plays behind the title.",
        fields: [
          {
            name: "hero.mediaType",
            label: "Background type",
            type: "select",
            options: [
              { value: "gradient", label: "Colour gradient" },
              { value: "image", label: "Image" },
              { value: "video", label: "Looping video" },
              { value: "showreel", label: "Looping video + “Play showreel” button" },
            ],
          },
          { name: "hero.overlayOpacity", label: "Darken image/video (0–90)", type: "number", min: 0, max: 90 },
          { name: "hero.image", label: "Background image (also used as the video's poster)", type: "media", accept: "image", full: true },
          { name: "hero.video", label: "Background video (MP4, short and muted)", type: "media", accept: "video", full: true },
          { name: "hero.showreelUrl", label: "Full showreel link (YouTube/Vimeo)", type: "url", full: true, help: "Opens when visitors press “Play showreel”. If empty, the background video is played." },
          { name: "hero.gradientFrom", label: "Gradient colour 1", type: "color" },
          { name: "hero.gradientTo", label: "Gradient colour 2", type: "color" },
        ],
      },
      {
        title: "Hero buttons",
        fields: [
          { name: "hero.primaryCtaLabel", label: "Main button text", type: "text" },
          { name: "hero.primaryCtaHref", label: "Main button link", type: "text", placeholder: "/work" },
          { name: "hero.secondaryCtaLabel", label: "Second button text", type: "text" },
          { name: "hero.secondaryCtaHref", label: "Second button link", type: "text", placeholder: "/contact" },
        ],
      },
      {
        title: "Sections",
        description: "Show, hide and reorder the homepage sections, and edit their headings.",
        fields: [{ name: "sections", label: "Homepage sections", type: "homeSections", full: true }],
      },
      {
        title: "Featured content",
        fields: [
          {
            name: "featuredProjects",
            label: "Featured projects (in order)",
            type: "relationMulti",
            resource: "projects",
            labelKey: "title",
            filterPublished: true,
            full: true,
          },
          {
            name: "technicalCategorySlug",
            label: "Category used for “Technical projects”",
            type: "text",
            help: "The URL name of a category, e.g. technical-projects.",
          },
        ],
      },
    ],
  },

  about: {
    endpoint: "about",
    title: "About page",
    description: "Your introduction. Education and skills are managed in their own sections.",
    previewPath: "/about",
    groups: [
      {
        title: "Introduction",
        fields: [
          { name: "eyebrow", label: "Small label", type: "text", placeholder: "About" },
          { name: "headline", label: "Headline", type: "text", full: true },
          { name: "intro", label: "Introduction", type: "textarea", rows: 10, full: true, help: "Leave a blank line between paragraphs. The first paragraph is shown larger." },
          { name: "portrait", label: "Portrait", type: "media", accept: "image", full: true },
        ],
      },
      {
        title: "Highlights",
        fields: [
          { name: "focusAreas", label: "What I do", type: "list", full: true },
          { name: "openTo", label: "Open to", type: "list", full: true, placeholder: "e.g. Freelance projects" },
          { name: "previewText", label: "Homepage preview text", type: "textarea", rows: 4, full: true, help: "Short version shown in the About section of the homepage." },
        ],
      },
      {
        title: "Search & sharing",
        fields: [
          { name: "seo.title", label: "Search title", type: "text", maxLength: 70 },
          { name: "seo.description", label: "Search description", type: "textarea", rows: 2, maxLength: 170 },
        ],
      },
    ],
  },

  settings: {
    endpoint: "site",
    title: "Site settings",
    description: "Branding, contact details, CV and footer.",
    groups: [
      {
        title: "Branding",
        fields: [
          { name: "siteName", label: "Your name / site name", type: "text" },
          { name: "brandName", label: "Creative brand", type: "text", placeholder: "rateusz" },
          { name: "tagline", label: "Tagline", type: "text", full: true, help: "Used in search results and structured data as your job title." },
          { name: "logo", label: "Logo (optional — replaces the text wordmark)", type: "media", accept: "image", full: true },
          { name: "favicon", label: "Browser tab icon (square PNG)", type: "media", accept: "image", full: true },
        ],
      },
      {
        title: "Contact",
        fields: [
          { name: "contactEmail", label: "Contact e-mail", type: "email", help: "Receives enquiry notifications." },
          { name: "showEmailPublicly", label: "Show e-mail address on the website", type: "toggle" },
          { name: "location", label: "Location", type: "text", placeholder: "London, UK" },
          { name: "availability", label: "Availability", type: "text", placeholder: "Available for freelance work" },
        ],
      },
      {
        title: "Contact page",
        fields: [
          { name: "contactPage.heading", label: "Heading", type: "text" },
          { name: "contactPage.intro", label: "Intro text", type: "textarea", rows: 3, full: true },
          { name: "contactPage.budgetOptions", label: "Budget options", type: "list", full: true, help: "Leave empty for a free-text budget field." },
          { name: "contactPage.successMessage", label: "Message after sending", type: "text", full: true },
        ],
      },
      {
        title: "CV & footer",
        fields: [
          { name: "cvFile", label: "CV (PDF)", type: "media", accept: "document", full: true },
          { name: "cvLabel", label: "CV button text", type: "text" },
          { name: "footerText", label: "Footer text", type: "textarea", rows: 2, full: true },
        ],
      },
    ],
  },

  seo: {
    endpoint: "site",
    title: "SEO",
    description: "Defaults for search engines and social sharing. Each project can override these.",
    groups: [
      {
        title: "Defaults",
        fields: [
          { name: "seo.defaultTitle", label: "Homepage title", type: "text", maxLength: 70, full: true },
          { name: "seo.titleTemplate", label: "Title pattern for other pages", type: "text", help: "%s is replaced by the page title.", full: true },
          { name: "seo.defaultDescription", label: "Default description", type: "textarea", rows: 3, maxLength: 170, full: true },
          { name: "seo.keywords", label: "Keywords", type: "list", full: true },
        ],
      },
      {
        title: "Social sharing",
        fields: [
          { name: "seo.ogImage", label: "Default share image (1200×630)", type: "media", accept: "image", full: true },
          { name: "seo.twitterHandle", label: "X / Twitter handle", type: "text", placeholder: "@handle" },
        ],
      },
    ],
  },

  social: {
    endpoint: "site",
    title: "Social links",
    description: "Leave any link empty to hide it everywhere on the site.",
    groups: [
      {
        title: "Profiles",
        fields: [
          { name: "social.instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/…" },
          { name: "social.instagramHandle", label: "Instagram handle (display)", type: "text", placeholder: "@matis.lens" },
          { name: "social.tiktok", label: "TikTok URL", type: "url" },
          { name: "social.youtube", label: "YouTube URL", type: "url" },
          { name: "social.vimeo", label: "Vimeo URL", type: "url" },
          { name: "social.linkedin", label: "LinkedIn URL", type: "url" },
          { name: "social.github", label: "GitHub URL", type: "url" },
        ],
      },
    ],
  },
};
