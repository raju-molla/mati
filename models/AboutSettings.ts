import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Singleton document (key: "about"). */
const AboutSettingsSchema = new Schema(
  {
    key: { type: String, default: "about" },
    eyebrow: { type: String, default: "", maxlength: 60 },
    headline: { type: String, default: "", maxlength: 200 },
    /** Paragraphs separated by blank lines. */
    intro: { type: String, default: "", maxlength: 6000 },
    portrait: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    secondaryImage: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    /** Short "what I do" statements. */
    focusAreas: { type: [String], default: [] },
    /** Short preview used on the homepage. */
    previewText: { type: String, default: "", maxlength: 600 },
    openTo: { type: [String], default: [] },
    seo: {
      title: { type: String, default: "", maxlength: 70 },
      description: { type: String, default: "", maxlength: 170 },
    },
  },
  { timestamps: true }
);

AboutSettingsSchema.index({ key: 1 }, { unique: true });

export type AboutSettingsDoc = InferSchemaType<typeof AboutSettingsSchema>;
export const AboutSettings: Model<AboutSettingsDoc> =
  models.AboutSettings || model<AboutSettingsDoc>("AboutSettings", AboutSettingsSchema);
