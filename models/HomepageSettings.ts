import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const mediaRef = { type: Schema.Types.ObjectId, ref: "Media", default: null };

export const HOMEPAGE_SECTIONS = [
  "featuredWork",
  "disciplines",
  "photography",
  "services",
  "technical",
  "experience",
  "cta",
] as const;
export type HomepageSectionKey = (typeof HOMEPAGE_SECTIONS)[number];

const SectionConfigSchema = new Schema(
  {
    key: { type: String, enum: HOMEPAGE_SECTIONS, required: true },
    visible: { type: Boolean, default: true },
    eyebrow: { type: String, default: "", maxlength: 60 },
    heading: { type: String, default: "", maxlength: 140 },
    intro: { type: String, default: "", maxlength: 600 },
  },
  { _id: false }
);

/** Singleton document (key: "home"). */
const HomepageSettingsSchema = new Schema(
  {
    key: { type: String, default: "home" },
    hero: {
      eyebrow: { type: String, default: "", maxlength: 80 },
      title: { type: String, default: "", maxlength: 80 },
      subtitle: { type: String, default: "", maxlength: 160 },
      roles: { type: [String], default: [] },
      description: { type: String, default: "", maxlength: 400 },
      mediaType: { type: String, enum: ["image", "video", "showreel", "gradient"], default: "gradient" },
      image: mediaRef,
      video: mediaRef,
      /** YouTube / Vimeo URL for the full showreel (opens in a player). */
      showreelUrl: { type: String, default: "" },
      gradientFrom: { type: String, default: "#14120f" },
      gradientTo: { type: String, default: "#2a2119" },
      overlayOpacity: { type: Number, default: 55, min: 0, max: 90 },
      primaryCtaLabel: { type: String, default: "View My Work", maxlength: 40 },
      primaryCtaHref: { type: String, default: "/work", maxlength: 300 },
      secondaryCtaLabel: { type: String, default: "Contact Me", maxlength: 40 },
      secondaryCtaHref: { type: String, default: "/contact", maxlength: 300 },
    },
    /** Explicit featured projects (in order). Empty = use projects flagged "featured". */
    featuredProjects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    /** Category slug used for the "technical" section. */
    technicalCategorySlug: { type: String, default: "technical-projects" },
    sections: { type: [SectionConfigSchema], default: [] },
  },
  { timestamps: true }
);

HomepageSettingsSchema.index({ key: 1 }, { unique: true });

export type HomepageSettingsDoc = InferSchemaType<typeof HomepageSettingsSchema>;
export const HomepageSettings: Model<HomepageSettingsDoc> =
  models.HomepageSettings || model<HomepageSettingsDoc>("HomepageSettings", HomepageSettingsSchema);
