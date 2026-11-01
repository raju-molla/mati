import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { slugify } from "@/lib/utils/slugify";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 600 },
    /** How projects in this category are laid out on the category page. */
    layout: { type: String, enum: ["grid", "masonry"], default: "grid" },
    coverImage: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ displayOrder: 1 });

CategorySchema.pre("validate", function () {
  if (!this.slug && this.name) this.slug = slugify(this.name);
});

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category: Model<CategoryDoc> =
  models.Category || model<CategoryDoc>("Category", CategorySchema);
