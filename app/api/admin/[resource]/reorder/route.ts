import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic } from "@/lib/api";
import { reorderSchema } from "@/lib/validation";
import { getResource } from "@/services/resources";

type Ctx = { params: Promise<{ resource: string }> };

/** Body: { ids: string[] } in the desired order. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const cfg = getResource((await params).resource);
    if (!cfg || !cfg.orderField) return fail("Not found", 404);
    const { ids } = reorderSchema.parse(await readJson(req));
    await connectDB();
    await cfg.model.bulkWrite(
      ids.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { [cfg.orderField!]: index } } },
      }))
    );
    revalidatePublic();
    return ok({ reordered: ids.length });
  } catch (err) {
    return handleError(err);
  }
}
