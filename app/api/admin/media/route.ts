import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic, serialize } from "@/lib/api";
import { mediaRegisterSchema } from "@/lib/validation";
import { getCloudinary, UPLOAD_RULES, uploadFolder } from "@/lib/cloudinary";
import { videoPoster } from "@/lib/utils/media";
import { Media } from "@/models";

const PAGE_SIZE = 48;

/** GET ?q=search&kind=image|video|document&photo=1&page=1 */
export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const sp = new URL(req.url).searchParams;
    const filter: Record<string, unknown> = {};
    const kind = sp.get("kind");
    if (kind === "image" || kind === "video" || kind === "document") filter.kind = kind;
    if (sp.get("photo") === "1") filter.inPhotography = true;
    const q = (sp.get("q") ?? "").trim().slice(0, 100);
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ filename: rx }, { alt: rx }, { caption: rx }, { tags: rx }, { photoCollection: rx }];
    }
    const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
    const [items, total] = await Promise.all([
      Media.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean(),
      Media.countDocuments(filter),
    ]);
    return ok({ items: serialize(items), total, page, pageSize: PAGE_SIZE });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Called after the browser finished uploading to Cloudinary. We fetch the
 * asset from Cloudinary's Admin API (never trusting client-reported values),
 * enforce folder/format/size rules, then store its metadata.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = mediaRegisterSchema.parse(await readJson(req));
    const cloudinary = getCloudinary();

    const kind = body.resourceType === "video" ? "video" : body.resourceType === "raw" ? "document" : "image";
    const rules = UPLOAD_RULES[kind];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let asset: any;
    try {
      asset = await cloudinary.api.resource(body.publicId, { resource_type: body.resourceType });
    } catch {
      return fail("Uploaded file could not be found on the media server.", 400);
    }

    // Only accept files in our upload folder (fixed- or dynamic-folder Cloudinary accounts).
    const folder = uploadFolder(kind);
    if (!String(asset.public_id).startsWith(`${folder}/`) && asset.asset_folder !== folder) {
      return fail("Upload location not allowed.", 400);
    }

    const format = String(asset.format ?? body.publicId.split(".").pop() ?? "").toLowerCase();
    const formatOk = (rules.formats as readonly string[]).includes(format);
    const sizeOk = Number(asset.bytes) <= rules.maxBytes;
    if (!formatOk || !sizeOk) {
      await cloudinary.uploader.destroy(body.publicId, { resource_type: body.resourceType, invalidate: true });
      return fail(!formatOk ? `.${format} files are not allowed here.` : "That file is too large.", 400);
    }

    await connectDB();
    const url: string = asset.secure_url;
    const doc = await Media.create({
      url,
      publicId: asset.public_id,
      resourceType: body.resourceType,
      kind,
      format,
      filename: body.filename || asset.original_filename || asset.public_id.split("/").pop(),
      size: asset.bytes,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      posterUrl: kind === "video" ? videoPoster(url) : "",
      alt: body.alt ?? "",
      caption: body.caption ?? "",
    });
    revalidatePublic();
    return ok(serialize(doc.toObject()), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
