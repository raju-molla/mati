import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic, serialize } from "@/lib/api";
import { getResource } from "@/services/resources";

type Ctx = { params: Promise<{ resource: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const cfg = getResource((await params).resource);
    if (!cfg) return fail("Not found", 404);
    await connectDB();
    let q = cfg.model.find().sort(cfg.sort);
    if (cfg.populate) q = q.populate(cfg.populate as never);
    return ok(serialize(await q.lean()));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const cfg = getResource((await params).resource);
    if (!cfg || !cfg.createSchema) return fail("Not found", 404);
    const data = cfg.createSchema.parse(await readJson(req)) as Record<string, unknown>;
    await connectDB();

    // New items go to the end of the list unless an order was given.
    if (cfg.orderField && data[cfg.orderField] === undefined) {
      const last = await cfg.model.findOne().sort({ [cfg.orderField]: -1 }).select(cfg.orderField).lean();
      data[cfg.orderField] = (((last as Record<string, number> | null)?.[cfg.orderField] ?? -1) as number) + 1;
    }
    if (data.slug === "") delete data.slug;

    const doc = await cfg.model.create(data);
    revalidatePublic();
    return ok(serialize(doc.toObject()), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
