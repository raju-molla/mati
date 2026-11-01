import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { slugify } from "@/lib/utils/slugify";

const mediaRef = { type: Schema.Types.ObjectId, ref: "Media", default: null };

/**
 * Optional flexible content blocks so not every case study has to follow the
 * same template. Rendered in order after the standard sections.
 */
const SectionSchema = new Schema(
  {
    type: { type: String, enum: ["text", "image", "gallery", "video", "quote"], required: true },
    heading: { type: String, default: "", maxlength: 160 },
    body: { type: String, default: "", maxlength: 10000 },
    media: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    embedUrl: { type: String, default: "" },
  },
  { _id: true }
);

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    subtitle: { type: String, default: "", maxlength: 240 },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    shortDescription: { type: String, default: "", maxlength: 400 },
    fullDescription: { type: String, default: "", maxlength: 20000 },
    challenge: { type: String, default: "", maxlength: 10000 },
    process: { type: String, default: "", maxlength: 10000 },
    outcome: { type: String, default: "", maxlength: 10000 },

    coverImage: mediaRef,
    thumbnail: mediaRef,
    gallery: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    videos: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    embeddedVideo: { type: String, default: "" },
    sections: { type: [SectionSchema], default: [] },

    technologies: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    role: { type: String, default: "", maxlength: 160 },
    client: { type: String, default: "", maxlength: 160 },
    year: { type: String, default: "", maxlength: 20 },
    duration: { type: String, default: "", maxlength: 60 },
    projectURL: { type: String, default: "" },
    githubURL: { type: String, default: "" },

    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },

    seo: {
      title: { type: String, default: "", maxlength: 70 },
      description: { type: String, default: "", maxlength: 170 },
      ogImage: mediaRef,
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ slug: 1 }, { unique: true });
ProjectSchema.index({ published: 1, displayOrder: 1 });
ProjectSchema.index({ category: 1, published: 1 });
ProjectSchema.index({ featured: 1, published: 1 });

ProjectSchema.pre("validate", function () {
  if (!this.slug && this.title) this.slug = slugify(this.title);
});

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;
export const Project: Model<ProjectDoc> =
  models.Project || model<ProjectDoc>("Project", ProjectSchema);
