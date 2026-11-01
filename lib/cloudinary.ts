import "server-only";
import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured (CLOUDINARY_* env vars missing)");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

export const UPLOAD_RULES = {
  image: { formats: ["jpg", "jpeg", "png", "webp", "avif"], maxBytes: 20 * 1024 * 1024, resourceType: "image" },
  video: { formats: ["mp4"], maxBytes: 200 * 1024 * 1024, resourceType: "video" },
  // PDFs are stored as "raw" files: always downloadable, no image-delivery restrictions.
  document: { formats: ["pdf"], maxBytes: 15 * 1024 * 1024, resourceType: "raw" },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

export function uploadFolder(kind: UploadKind) {
  const root = (process.env.CLOUDINARY_FOLDER || "rateusz").replace(/[^a-zA-Z0-9_\-/]/g, "");
  return `${root}/${kind === "document" ? "documents" : kind === "video" ? "videos" : "images"}`;
}
