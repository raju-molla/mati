import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/**
 * Metadata for a file stored on Cloudinary. Binaries never live in MongoDB.
 * Images can also be shown in the public Photography gallery.
 */
const MediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "video", "raw"], required: true },
    /** Simplified kind used in the admin UI. */
    kind: { type: String, enum: ["image", "video", "document"], required: true },
    format: { type: String, default: "" },
    filename: { type: String, default: "" },
    size: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    /** For videos: a generated poster frame URL. */
    posterUrl: { type: String, default: "" },
    alt: { type: String, default: "", maxlength: 300 },
    caption: { type: String, default: "", maxlength: 600 },
    tags: { type: [String], default: [] },

    // Photography gallery
    inPhotography: { type: Boolean, default: false },
    photoCollection: { type: String, default: "", trim: true, maxlength: 80 },
    photoFeatured: { type: Boolean, default: false },
    photoOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MediaSchema.index({ publicId: 1 }, { unique: true });
MediaSchema.index({ kind: 1, createdAt: -1 });
MediaSchema.index({ inPhotography: 1, photoOrder: 1 });
MediaSchema.index({ filename: "text", alt: "text", caption: "text", tags: "text" });

export type MediaDoc = InferSchemaType<typeof MediaSchema>;
export const Media: Model<MediaDoc> = models.Media || model<MediaDoc>("Media", MediaSchema);
