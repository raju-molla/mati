/**
 * Plain, serialisable shapes passed from the server to components.
 * ObjectIds become strings, Dates become ISO strings.
 */

export type MediaKind = "image" | "video" | "document";

export interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  kind: MediaKind;
  format: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  posterUrl: string;
  alt: string;
  caption: string;
  tags: string[];
  inPhotography: boolean;
  photoCollection: string;
  photoFeatured: boolean;
  photoOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  layout: "grid" | "masonry";
  coverImage: MediaItem | null;
  displayOrder: number;
  published: boolean;
}

export interface ProjectSection {
  _id?: string;
  type: "text" | "image" | "gallery" | "video" | "quote";
  heading: string;
  body: string;
  media: MediaItem[];
  embedUrl: string;
}

export interface ProjectItem {
  _id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: CategoryItem | null;
  shortDescription: string;
  fullDescription: string;
  challenge: string;
  process: string;
  outcome: string;
  coverImage: MediaItem | null;
  thumbnail: MediaItem | null;
  gallery: MediaItem[];
  videos: MediaItem[];
  embeddedVideo: string;
  sections: ProjectSection[];
  technologies: string[];
  tools: string[];
  role: string;
  client: string;
  year: string;
  duration: string;
  projectURL: string;
  githubURL: string;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  seo: { title: string; description: string; ogImage: MediaItem | null };
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceItem {
  _id: string;
  role: string;
  organisation: string;
  location: string;
  period: string;
  current: boolean;
  summary: string;
  highlights: string[];
  tools: string[];
  type: "creative" | "technical" | "operations" | "other";
  displayOrder: number;
  published: boolean;
}

export interface EducationItem {
  _id: string;
  institution: string;
  qualification: string;
  period: string;
  grade: string;
  location: string;
  details: string[];
  displayOrder: number;
  published: boolean;
}

export interface SkillCategoryItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  published: boolean;
}

export interface SkillItem {
  _id: string;
  name: string;
  category: SkillCategoryItem | null;
  icon: MediaItem | null;
  proficiency: "" | "familiar" | "proficient" | "advanced";
  displayOrder: number;
  published: boolean;
}

export interface SkillGroupItem {
  category: SkillCategoryItem;
  skills: SkillItem[];
}

export interface ServiceItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: MediaItem | null;
  iconName: string;
  deliverables: string[];
  price: string;
  ctaLabel: string;
  ctaUrl: string;
  displayOrder: number;
  published: boolean;
}

export type MessageStatus = "new" | "read" | "replied" | "archived";

export interface ContactMessageItem {
  _id: string;
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  status: MessageStatus;
  notes: string;
  createdAt: string;
}

export interface SocialLinks {
  instagram: string;
  instagramHandle: string;
  linkedin: string;
  youtube: string;
  vimeo: string;
  tiktok: string;
  github: string;
}

export interface SiteSettingsData {
  siteName: string;
  brandName: string;
  tagline: string;
  logo: MediaItem | null;
  favicon: MediaItem | null;
  contactEmail: string;
  showEmailPublicly: boolean;
  location: string;
  availability: string;
  footerText: string;
  cvFile: MediaItem | null;
  cvLabel: string;
  social: SocialLinks;
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: MediaItem | null;
    twitterHandle: string;
  };
  contactPage: {
    heading: string;
    intro: string;
    budgetOptions: string[];
    successMessage: string;
  };
}

export type HomepageSectionKey =
  | "featuredWork"
  | "disciplines"
  | "photography"
  | "services"
  | "technical"
  | "experience"
  | "cta";

export interface HomepageSectionConfig {
  key: HomepageSectionKey;
  visible: boolean;
  eyebrow: string;
  heading: string;
  intro: string;
}

export interface HomepageData {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    roles: string[];
    description: string;
    mediaType: "image" | "video" | "showreel" | "gradient";
    image: MediaItem | null;
    video: MediaItem | null;
    showreelUrl: string;
    gradientFrom: string;
    gradientTo: string;
    overlayOpacity: number;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  featuredProjects: ProjectItem[];
  technicalCategorySlug: string;
  sections: HomepageSectionConfig[];
}

export interface AboutData {
  eyebrow: string;
  headline: string;
  intro: string;
  portrait: MediaItem | null;
  secondaryImage: MediaItem | null;
  focusAreas: string[];
  previewText: string;
  openTo: string[];
  seo: { title: string; description: string };
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}
