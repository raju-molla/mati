import type { MediaItem } from "@/types";
import type { FieldDef } from "./fields/types";

type Item = Record<string, unknown> & { _id: string };

export interface ResourceUIConfig {
  resource: string;
  title: string;
  singular: string;
  description?: string;
  fields: FieldDef[];
  /** Default values for a new item. */
  blank: Record<string, unknown>;
  primary: (i: Item) => string;
  secondary?: (i: Item) => string;
  thumb?: (i: Item) => MediaItem | null | undefined;
  orderable?: boolean;
  publishable?: boolean;
  featurable?: boolean;
  /** If set, editing navigates to a full page instead of the side panel. */
  editPath?: (id: string) => string;
  newPath?: string;
  publicPath?: (i: Item) => string | null;
  emptyText: string;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const name = (v: unknown, key = "name") => (v && typeof v === "object" ? str((v as Record<string, unknown>)[key]) : "");

export const RESOURCE_CONFIGS: Record<string, ResourceUIConfig> = {
  projects: {
    resource: "projects",
    title: "Projects",
    singular: "project",
    description: "Everything shown on the Work pages. Drag to change the order visitors see.",
    fields: [],
    blank: {},
    primary: (i) => str(i.title),
    secondary: (i) => [name(i.category), str(i.year)].filter(Boolean).join(" · ") || "No category",
    thumb: (i) => (i.thumbnail ?? i.coverImage) as MediaItem | null,
    orderable: true,
    publishable: true,
    featurable: true,
    editPath: (id) => `/admin/projects/${id}`,
    newPath: "/admin/projects/new",
    publicPath: (i) => (i.published ? `/work/${str(i.slug)}` : null),
    emptyText: "No projects yet. Add your first one to start building the portfolio.",
  },

  categories: {
    resource: "categories",
    title: "Categories",
    singular: "category",
    description: "Groups for your projects (e.g. Game Development, Photography). Shown as filters on the Work page.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL name", type: "text", help: "Leave empty to create it from the name. Used in /work/category/…" },
      { name: "description", label: "Short description", type: "textarea", rows: 3, full: true },
      {
        name: "layout",
        label: "Page layout",
        type: "select",
        options: [
          { value: "grid", label: "Editorial grid" },
          { value: "masonry", label: "Masonry (good for photography)" },
        ],
      },
      { name: "coverImage", label: "Cover image (optional)", type: "media", accept: "image" },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { name: "", slug: "", description: "", layout: "grid", coverImage: null, published: true },
    primary: (i) => str(i.name),
    secondary: (i) => `/work/category/${str(i.slug)}`,
    thumb: (i) => i.coverImage as MediaItem | null,
    orderable: true,
    publishable: true,
    publicPath: (i) => (i.published ? `/work/category/${str(i.slug)}` : null),
    emptyText: "No categories yet.",
  },

  experience: {
    resource: "experience",
    title: "Experience",
    singular: "role",
    description: "Your work history, shown on the Experience page and homepage.",
    fields: [
      { name: "role", label: "Job title", type: "text", required: true },
      { name: "organisation", label: "Organisation", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "period", label: "Dates", type: "text", placeholder: "February 2026 – Present" },
      { name: "current", label: "I currently work here", type: "toggle" },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: [
          { value: "creative", label: "Creative" },
          { value: "technical", label: "Technical" },
          { value: "operations", label: "Operations" },
          { value: "other", label: "Other" },
        ],
      },
      { name: "summary", label: "Summary (optional)", type: "textarea", rows: 3, full: true },
      { name: "highlights", label: "Responsibilities / highlights", type: "list", full: true },
      { name: "tools", label: "Tools used", type: "list", full: true, placeholder: "e.g. DaVinci Resolve" },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { role: "", organisation: "", location: "", period: "", current: false, type: "other", summary: "", highlights: [], tools: [], published: true },
    primary: (i) => str(i.role),
    secondary: (i) => [str(i.organisation), str(i.period)].filter(Boolean).join(" · "),
    orderable: true,
    publishable: true,
    emptyText: "No experience added yet.",
  },

  education: {
    resource: "education",
    title: "Education",
    singular: "qualification",
    description: "Shown on the About page.",
    fields: [
      { name: "qualification", label: "Qualification", type: "text", required: true, placeholder: "BA (Hons) Game Arts and Design" },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "period", label: "Dates", type: "text", placeholder: "2021–2024" },
      { name: "grade", label: "Grade (optional)", type: "text" },
      { name: "location", label: "Location (optional)", type: "text" },
      { name: "details", label: "Details (subjects, grades…)", type: "list", full: true },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { qualification: "", institution: "", period: "", grade: "", location: "", details: [], published: true },
    primary: (i) => str(i.qualification),
    secondary: (i) => [str(i.institution), str(i.period)].filter(Boolean).join(" · "),
    orderable: true,
    publishable: true,
    emptyText: "No education added yet.",
  },

  "skill-categories": {
    resource: "skill-categories",
    title: "Skill groups",
    singular: "skill group",
    description: "Headings your skills are grouped under (e.g. Creative, Technical, Professional).",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL name", type: "text", help: "Leave empty to generate automatically." },
      { name: "description", label: "Description (optional)", type: "textarea", rows: 2, full: true },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { name: "", slug: "", description: "", published: true },
    primary: (i) => str(i.name),
    orderable: true,
    publishable: true,
    emptyText: "No skill groups yet.",
  },

  skills: {
    resource: "skills",
    title: "Skills",
    singular: "skill",
    description: "No percentage bars — just the tools and abilities you want to highlight.",
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      { name: "category", label: "Group", type: "relation", resource: "skill-categories", labelKey: "name", emptyLabel: "— Choose a group —" },
      {
        name: "proficiency",
        label: "Level (optional)",
        type: "select",
        options: [
          { value: "", label: "Don't show a level" },
          { value: "familiar", label: "Familiar" },
          { value: "proficient", label: "Proficient" },
          { value: "advanced", label: "Advanced" },
        ],
      },
      { name: "icon", label: "Icon (optional)", type: "media", accept: "image" },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { name: "", category: null, proficiency: "", icon: null, published: true },
    primary: (i) => str(i.name),
    secondary: (i) => name(i.category) || "No group",
    thumb: (i) => i.icon as MediaItem | null,
    orderable: true,
    publishable: true,
    emptyText: "No skills yet.",
  },

  services: {
    resource: "services",
    title: "Services",
    singular: "service",
    description: "What you offer. Prices only appear if you fill them in.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL name", type: "text", help: "Leave empty to generate automatically." },
      { name: "description", label: "Description", type: "textarea", rows: 4, full: true },
      { name: "deliverables", label: "Deliverables", type: "list", full: true, placeholder: "e.g. Short-form vertical edits" },
      { name: "iconName", label: "Icon (used when there is no image)", type: "icon", full: true },
      { name: "image", label: "Image (optional)", type: "media", accept: "image" },
      { name: "price", label: "Price (optional)", type: "text", placeholder: "e.g. From £150" },
      { name: "ctaLabel", label: "Button text", type: "text", placeholder: "Start a project" },
      { name: "ctaUrl", label: "Button link (optional)", type: "text", help: "Leave empty to link to the contact form with this service pre-selected." },
      { name: "published", label: "Visible on the website", type: "toggle" },
    ],
    blank: { title: "", slug: "", description: "", deliverables: [], iconName: "", image: null, price: "", ctaLabel: "", ctaUrl: "", published: true },
    primary: (i) => str(i.title),
    secondary: (i) => (Array.isArray(i.deliverables) ? `${i.deliverables.length} deliverables` : ""),
    thumb: (i) => i.image as MediaItem | null,
    orderable: true,
    publishable: true,
    emptyText: "No services yet.",
  },
};
