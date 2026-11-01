import { isValidObjectId, models } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic, serialize, toSetPaths } from "@/lib/api";
import { getResource } from "@/services/resources";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function resolve(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  const cfg = getResource(resource);
  if (!cfg || !isValidObjectId(id)) return null;
  return { cfg, id };
}

export async function GET(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const r = await resolve(ctx);
    if (!r) return fail("Not found", 404);
    await connectDB();
    let q = r.cfg.model.findById(r.id);
    if (r.cfg.populate) q = q.populate(r.cfg.populate as never);
    const doc = await q.lean();
    if (!doc) return fail("Not found", 404);
    return ok(serialize(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const r = await resolve(ctx);
    if (!r) return fail("Not found", 404);
    const data = r.cfg.updateSchema.parse(await readJson(req)) as Record<string, unknown>;
    if (data.slug === "") delete data.slug;
    await connectDB();

    // Nested groups (e.g. seo.*) are flattened so siblings aren't overwritten.
    const doc = await r.cfg.model
      .findByIdAndUpdate(r.id, { $set: toSetPaths(data) }, { new: true, runValidators: true })
      .lean();
    if (!doc) return fail("Not found", 404);
    revalidatePublic();
    return ok(serialize(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    await requireAdmin();
    const r = await resolve(ctx);
    if (!r) return fail("Not found", 404);
    await connectDB();

    for (const dep of r.cfg.dependents ?? []) {
      const count = await models[dep.model]!.countDocuments({ [dep.field]: r.id });
      if (count > 0) {
        return fail(
          `This ${r.cfg.label.toLowerCase()} is used by ${count} ${dep.label}${count === 1 ? "" : "s"}. Move or delete them first.`,
          409
        );
      }
    }

    const doc = await r.cfg.model.findByIdAndDelete(r.id).lean();
    if (!doc) return fail("Not found", 404);
    revalidatePublic();
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
