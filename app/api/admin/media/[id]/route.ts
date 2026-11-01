import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic, serialize } from "@/lib/api";
import { mediaUpdateSchema } from "@/lib/validation";
import { getCloudinary } from "@/lib/cloudinary";
import { Media } from "@/models";
import { detachMedia, findMediaUsage } from "@/services/media-usage";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Not found", 404);
    const data = mediaUpdateSchema.parse(await readJson(req));
    await connectDB();
    const doc = await Media.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
    if (!doc) return fail("Not found", 404);
    revalidatePublic();
    return ok(serialize(doc));
  } catch (err) {
    return handleError(err);
  }
}

/** DELETE — returns 409 with `usage` if the file is in use, unless ?force=1. */
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isValidObjectId(id)) return fail("Not found", 404);
    await connectDB();
    const media = await Media.findById(id).lean();
    if (!media) return fail("Not found", 404);

    const force = new URL(req.url).searchParams.get("force") === "1";
    const usage = await findMediaUsage(id);
    if (usage.length && !force) {
      return fail("This file is in use.", 409, { usage });
    }

    try {
      await getCloudinary().uploader.destroy(media.publicId, {
        resource_type: media.resourceType,
        invalidate: true,
      });
    } catch (err) {
      console.error("[media] Cloudinary delete failed", err);
    }
    if (usage.length) await detachMedia(id);
    await Media.deleteOne({ _id: id });
    revalidatePublic();
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
