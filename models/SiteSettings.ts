import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const mediaRef = { type: Schema.Types.ObjectId, ref: "Media", default: null };

/** Singleton document (key: "site"). */
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "site" },
    siteName: { type: String, default: "Mateusz Tomaszek", maxlength: 80 },
    brandName: { type: String, default: "rateusz", maxlength: 40 },
    tagline: { type: String, default: "", maxlength: 160 },
    logo: mediaRef,
    favicon: mediaRef,

    contactEmail: { type: String, default: "", maxlength: 254 },
    /** If false the e-mail address is never rendered publicly; visitors use the form. */
    showEmailPublicly: { type: Boolean, default: false },
    location: { type: String, default: "", maxlength: 120 },
    availability: { type: String, default: "", maxlength: 160 },
    footerText: { type: String, default: "", maxlength: 400 },
    cvFile: mediaRef,
    cvLabel: { type: String, default: "Download CV", maxlength: 40 },

    social: {
      instagram: { type: String, default: "" },
      instagramHandle: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
      vimeo: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      github: { type: String, default: "" },
    },

    seo: {
      defaultTitle: { type: String, default: "", maxlength: 70 },
      titleTemplate: { type: String, default: "%s — Mateusz Tomaszek", maxlength: 70 },
      defaultDescription: { type: String, default: "", maxlength: 170 },
      keywords: { type: [String], default: [] },
      ogImage: mediaRef,
      twitterHandle: { type: String, default: "" },
    },

    contactPage: {
      heading: { type: String, default: "", maxlength: 120 },
      intro: { type: String, default: "", maxlength: 600 },
      budgetOptions: { type: [String], default: [] },
      successMessage: { type: String, default: "", maxlength: 300 },
    },
  },
  { timestamps: true }
);

SiteSettingsSchema.index({ key: 1 }, { unique: true });

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema>;
export const SiteSettings: Model<SiteSettingsDoc> =
  models.SiteSettings || model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
