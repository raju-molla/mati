import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const SkillSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: Schema.Types.ObjectId, ref: "SkillCategory", default: null },
    icon: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    /** Optional, descriptive (never a percentage). Empty = not shown. */
    proficiency: { type: String, enum: ["", "familiar", "proficient", "advanced"], default: "" },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SkillSchema.index({ category: 1, displayOrder: 1 });

export type SkillDoc = InferSchemaType<typeof SkillSchema>;
export const Skill: Model<SkillDoc> = models.Skill || model<SkillDoc>("Skill", SkillSchema);
