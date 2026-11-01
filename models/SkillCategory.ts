import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { slugify } from "@/lib/utils/slugify";

const SkillCategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 400 },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SkillCategorySchema.index({ slug: 1 }, { unique: true });

SkillCategorySchema.pre("validate", function () {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

export type SkillCategoryDoc = InferSchemaType<typeof SkillCategorySchema>;
export const SkillCategory: Model<SkillCategoryDoc> =
  models.SkillCategory || model<SkillCategoryDoc>("SkillCategory", SkillCategorySchema);
