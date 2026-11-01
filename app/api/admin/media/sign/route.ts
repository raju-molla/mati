import { requireAdmin } from "@/lib/auth/session";
import { handleError, ok, readJson } from "@/lib/api";
import { mediaSignSchema } from "@/lib/validation";
import { getCloudinary, UPLOAD_RULES, uploadFolder } from "@/lib/cloudinary";

/**
 * Returns a short-lived signature so the browser can upload directly to
 * Cloudinary (large videos never pass through our serverless functions).
 * The signed params pin the folder and allowed formats.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { kind } = mediaSignSchema.parse(await readJson(req));
    const rules = UPLOAD_RULES[kind];
    const cloudinary = getCloudinary();
    const timestamp = Math.round(Date.now() / 1000);

    const params: Record<string, string | number> = {
      timestamp,
      folder: uploadFolder(kind),
      use_filename: "true",
      unique_filename: "true",
    };
    if (rules.resourceType !== "raw") params.allowed_formats = rules.formats.join(",");

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);

    return ok({
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${rules.resourceType}/upload`,
      apiKey: process.env.CLOUDINARY_API_KEY,
      signature,
      params,
      resourceType: rules.resourceType,
      maxBytes: rules.maxBytes,
      formats: rules.formats,
    });
  } catch (err) {
    return handleError(err);
  }
}
