import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ExperienceSchema = new Schema(
  {
    role: { type: String, required: true, trim: true, maxlength: 160 },
    organisation: { type: String, required: true, trim: true, maxlength: 160 },
    location: { type: String, default: "", maxlength: 120 },
    /** Free-text period shown to visitors, e.g. "February 2026 – Present". */
    period: { type: String, default: "", maxlength: 80 },
    current: { type: Boolean, default: false },
    summary: { type: String, default: "", maxlength: 1000 },
    highlights: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    type: { type: String, enum: ["creative", "technical", "operations", "other"], default: "other" },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExperienceSchema.index({ displayOrder: 1 });

export type ExperienceDoc = InferSchemaType<typeof ExperienceSchema>;
export const Experience: Model<ExperienceDoc> =
  models.Experience || model<ExperienceDoc>("Experience", ExperienceSchema);
