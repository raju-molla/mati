import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const EducationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true, maxlength: 160 },
    qualification: { type: String, required: true, trim: true, maxlength: 200 },
    period: { type: String, default: "", maxlength: 60 },
    grade: { type: String, default: "", maxlength: 60 },
    location: { type: String, default: "", maxlength: 120 },
    details: { type: [String], default: [] },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EducationSchema.index({ displayOrder: 1 });

export type EducationDoc = InferSchemaType<typeof EducationSchema>;
export const Education: Model<EducationDoc> =
  models.Education || model<EducationDoc>("Education", EducationSchema);
