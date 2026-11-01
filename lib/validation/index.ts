/**
 * Zod schemas for every write operation. Fields are optional (no .default())
 * so the same schema can be used with .partial() for PATCH without resetting
 * untouched fields; Mongoose supplies defaults on create.
 */
import { z } from "zod";
import { cleanText, safeUrl } from "@/lib/utils/sanitize";

export const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid reference");
const mediaRef = objectId.nullable().optional();
const mediaList = z.array(objectId).max(200).optional();

const text = (max: number) => z.string().max(max).transform(cleanText);
const reqText = (max: number, label = "This field") =>
  z.string().transform(cleanText).pipe(z.string().min(1, `${label} is required`).max(max));
const textList = (maxItems = 50, maxLen = 200) =>
  z
    .array(z.string().max(maxLen).transform(cleanText))
    .max(maxItems)
    .transform((arr) => arr.filter(Boolean))
    .optional();
const url = z
  .string()
  .max(500)
  .transform(safeUrl)
  .optional();
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .max(96)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Use lowercase letters, numbers and hyphens only")
  .optional();
const order = z.number().int().min(0).max(100000).optional();
const bool = z.boolean().optional();

/* ───────── Auth ───────── */
export const loginSchema = z.object({
  email: z.email("Enter a valid e-mail").max(254).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, "Enter your password").max(128),
});

export const accountSchema = z
  .object({
    name: text(120).optional(),
    email: z.email().max(254).transform((e) => e.toLowerCase().trim()).optional(),
    currentPassword: z.string().max(128).optional(),
    newPassword: z.string().max(128).optional(),
  })
  .refine((v) => !v.newPassword || !!v.currentPassword, {
    message: "Enter your current password to set a new one",
    path: ["currentPassword"],
  });

/* ───────── Content ───────── */
export const categorySchema = z.object({
  name: reqText(80, "Name"),
  slug,
  description: text(600).optional(),
  layout: z.enum(["grid", "masonry"]).optional(),
  coverImage: mediaRef,
  displayOrder: order,
  published: bool,
});

const sectionSchema = z.object({
  _id: objectId.optional(),
  type: z.enum(["text", "image", "gallery", "video", "quote"]),
  heading: text(160).optional(),
  body: text(10000).optional(),
  media: z.array(objectId).max(60).optional(),
  embedUrl: url,
});

export const projectSchema = z.object({
  title: reqText(160, "Title"),
  slug,
  subtitle: text(240).optional(),
  category: objectId.nullable().optional(),
  shortDescription: text(400).optional(),
  fullDescription: text(20000).optional(),
  challenge: text(10000).optional(),
  process: text(10000).optional(),
  outcome: text(10000).optional(),
  coverImage: mediaRef,
  thumbnail: mediaRef,
  gallery: mediaList,
  videos: mediaList,
  embeddedVideo: url,
  sections: z.array(sectionSchema).max(40).optional(),
  technologies: textList(30, 60),
  tools: textList(30, 60),
  role: text(160).optional(),
  client: text(160).optional(),
  year: text(20).optional(),
  duration: text(60).optional(),
  projectURL: url,
  githubURL: url,
  featured: bool,
  published: bool,
  displayOrder: order,
  seo: z
    .object({
      title: text(70).optional(),
      description: text(170).optional(),
      ogImage: mediaRef,
    })
    .optional(),
});

export const experienceSchema = z.object({
  role: reqText(160, "Role"),
  organisation: reqText(160, "Organisation"),
  location: text(120).optional(),
  period: text(80).optional(),
  current: bool,
  summary: text(1000).optional(),
  highlights: textList(20, 300),
  tools: textList(20, 60),
  type: z.enum(["creative", "technical", "operations", "other"]).optional(),
  displayOrder: order,
  published: bool,
});

export const educationSchema = z.object({
  institution: reqText(160, "Institution"),
  qualification: reqText(200, "Qualification"),
  period: text(60).optional(),
  grade: text(60).optional(),
  location: text(120).optional(),
  details: textList(20, 300),
  displayOrder: order,
  published: bool,
});

export const skillCategorySchema = z.object({
  name: reqText(80, "Name"),
  slug,
  description: text(400).optional(),
  displayOrder: order,
  published: bool,
});

export const skillSchema = z.object({
  name: reqText(80, "Name"),
  category: objectId.nullable().optional(),
  icon: mediaRef,
  proficiency: z.enum(["", "familiar", "proficient", "advanced"]).optional(),
  displayOrder: order,
  published: bool,
});

export const serviceSchema = z.object({
  title: reqText(120, "Title"),
  slug,
  description: text(1200).optional(),
  image: mediaRef,
  iconName: z.string().max(40).regex(/^[A-Za-z0-9]*$/, "Letters and numbers only").optional(),
  deliverables: textList(20, 160),
  price: text(80).optional(),
  ctaLabel: text(60).optional(),
  ctaUrl: url,
  displayOrder: order,
  published: bool,
});

export const messageUpdateSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]).optional(),
  notes: text(2000).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(objectId).min(1).max(500),
});

/* ───────── Media ───────── */
export const mediaRegisterSchema = z.object({
  publicId: z.string().min(1).max(300),
  resourceType: z.enum(["image", "video", "raw"]),
  filename: text(200).optional(),
  alt: text(300).optional(),
  caption: text(600).optional(),
});

export const mediaUpdateSchema = z.object({
  alt: text(300).optional(),
  caption: text(600).optional(),
  tags: textList(20, 40),
  inPhotography: bool,
  photoCollection: text(80).optional(),
  photoFeatured: bool,
  photoOrder: order,
});

export const mediaSignSchema = z.object({
  kind: z.enum(["image", "video", "document"]),
});

/* ───────── Contact ───────── */
export const contactSchema = z.object({
  name: reqText(120, "Name"),
  email: z.email("Enter a valid e-mail address").max(254),
  company: text(160).optional(),
  service: text(120).optional(),
  budget: text(60).optional(),
  timeline: text(120).optional(),
  message: z
    .string()
    .transform(cleanText)
    .pipe(z.string().min(20, "Please tell me a little more (20+ characters)").max(5000)),
  /** Honeypot — must stay empty. */
  website: z.string().max(500).optional(),
  /** Milliseconds since the form was rendered — bots submit instantly. */
  elapsedMs: z.number().int().min(0).optional(),
});
export type ContactInput = z.input<typeof contactSchema>;

/* ───────── Singletons ───────── */
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #1a1a1a").optional();

export const siteSettingsSchema = z.object({
  siteName: text(80).optional(),
  brandName: text(40).optional(),
  tagline: text(160).optional(),
  logo: mediaRef,
  favicon: mediaRef,
  contactEmail: z.union([z.email().max(254), z.literal("")]).optional(),
  showEmailPublicly: bool,
  location: text(120).optional(),
  availability: text(160).optional(),
  footerText: text(400).optional(),
  cvFile: mediaRef,
  cvLabel: text(40).optional(),
  social: z
    .object({
      instagram: url,
      instagramHandle: text(60).optional(),
      linkedin: url,
      youtube: url,
      vimeo: url,
      tiktok: url,
      github: url,
    })
    .partial()
    .optional(),
  seo: z
    .object({
      defaultTitle: text(70).optional(),
      titleTemplate: text(70).optional(),
      defaultDescription: text(170).optional(),
      keywords: textList(30, 60),
      ogImage: mediaRef,
      twitterHandle: text(40).optional(),
    })
    .partial()
    .optional(),
  contactPage: z
    .object({
      heading: text(120).optional(),
      intro: text(600).optional(),
      budgetOptions: textList(12, 60),
      successMessage: text(300).optional(),
    })
    .partial()
    .optional(),
});

const homepageSectionKeys = [
  "featuredWork",
  "disciplines",
  "photography",
  "services",
  "technical",
  "experience",
  "cta",
] as const;

export const homepageSchema = z.object({
  hero: z
    .object({
      eyebrow: text(80).optional(),
      title: text(80).optional(),
      subtitle: text(160).optional(),
      roles: textList(10, 60),
      description: text(400).optional(),
      mediaType: z.enum(["image", "video", "showreel", "gradient"]).optional(),
      image: mediaRef,
      video: mediaRef,
      showreelUrl: url,
      gradientFrom: hexColor,
      gradientTo: hexColor,
      overlayOpacity: z.number().min(0).max(90).optional(),
      primaryCtaLabel: text(40).optional(),
      primaryCtaHref: url,
      secondaryCtaLabel: text(40).optional(),
      secondaryCtaHref: url,
    })
    .partial()
    .optional(),
  featuredProjects: z.array(objectId).max(24).optional(),
  technicalCategorySlug: slug,
  sections: z
    .array(
      z.object({
        key: z.enum(homepageSectionKeys),
        visible: z.boolean(),
        eyebrow: text(60).optional(),
        heading: text(140).optional(),
        intro: text(600).optional(),
      })
    )
    .max(homepageSectionKeys.length)
    .optional(),
});

export const aboutSchema = z.object({
  eyebrow: text(60).optional(),
  headline: text(200).optional(),
  intro: text(6000).optional(),
  portrait: mediaRef,
  secondaryImage: mediaRef,
  focusAreas: textList(12, 200),
  previewText: text(600).optional(),
  openTo: textList(12, 80),
  seo: z
    .object({ title: text(70).optional(), description: text(170).optional() })
    .partial()
    .optional(),
});
