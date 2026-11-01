"use client";

import { api } from "./api";
import type { MediaItem, MediaKind } from "@/types";

interface SignResponse {
  uploadUrl: string;
  apiKey: string;
  signature: string;
  params: Record<string, string | number>;
  resourceType: "image" | "video" | "raw";
  maxBytes: number;
  formats: string[];
}

export const ACCEPT: Record<MediaKind, string> = {
  image: "image/jpeg,image/png,image/webp,image/avif",
  video: "video/mp4",
  document: "application/pdf",
};

export function kindForFile(file: File): MediaKind | null {
  if (/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return "image";
  if (file.type === "video/mp4") return "video";
  if (file.type === "application/pdf") return "document";
  return null;
}

/**
 * Upload flow:
 *  1. Ask our server for a signature (admin only).
 *  2. Send the file straight to Cloudinary with progress events.
 *  3. Register it with our server, which verifies it with Cloudinary and stores metadata.
 */
export async function uploadFile(
  file: File,
  opts: { alt?: string; onProgress?: (pct: number) => void } = {}
): Promise<MediaItem> {
  const kind = kindForFile(file);
  if (!kind) throw new Error(`${file.name}: unsupported file type. Use JPG, PNG, WEBP, AVIF, MP4 or PDF.`);

  const sign = await api<SignResponse>("/api/admin/media/sign", { method: "POST", body: { kind } });
  if (file.size > sign.maxBytes) {
    throw new Error(`${file.name} is too large (max ${Math.round(sign.maxBytes / 1024 / 1024)} MB).`);
  }

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("signature", sign.signature);
  for (const [k, v] of Object.entries(sign.params)) form.append(k, String(v));

  const uploaded = await new Promise<{ public_id: string; resource_type: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", sign.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(json);
        else reject(new Error(json?.error?.message ?? "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });

  return api<MediaItem>("/api/admin/media", {
    method: "POST",
    body: {
      publicId: uploaded.public_id,
      resourceType: sign.resourceType,
      filename: file.name,
      alt: opts.alt ?? "",
    },
  });
}
