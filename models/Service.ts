import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { slugify } from "@/lib/utils/slugify";

const ServiceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: "", maxlength: 1200 },
    image: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    /** Lucide icon name used when no image is set, e.g. "Film", "Camera". */
    iconName: { type: String, default: "", maxlength: 40 },
    deliverables: { type: [String], default: [] },
    /** Only shown when filled in by the admin. */
    price: { type: String, default: "", maxlength: 80 },
    ctaLabel: { type: String, default: "", maxlength: 60 },
    ctaUrl: { type: String, default: "", maxlength: 300 },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ slug: 1 }, { unique: true });
ServiceSchema.index({ displayOrder: 1 });

ServiceSchema.pre("validate", function () {
  if (!this.slug && this.title) this.slug = slugify(this.title);
});

export type ServiceDoc = InferSchemaType<typeof ServiceSchema>;
export const Service: Model<ServiceDoc> =
  models.Service || model<ServiceDoc>("Service", ServiceSchema);
