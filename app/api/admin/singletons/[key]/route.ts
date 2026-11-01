import type { Model } from "mongoose";
import type { ZodType } from "zod";
import { connectDB } from "@/lib/db/connect";
import { requireAdmin } from "@/lib/auth/session";
import { fail, handleError, ok, readJson, revalidatePublic, serialize, toSetPaths } from "@/lib/api";
import { aboutSchema, homepageSchema, siteSettingsSchema } from "@/lib/validation";
import { AboutSettings, HomepageSettings, SiteSettings } from "@/models";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SINGLETONS: Record<string, { model: Model<any>; key: string; schema: ZodType }> = {
  site: { model: SiteSettings, key: "site", schema: siteSettingsSchema },
  home: { model: HomepageSettings, key: "home", schema: homepageSchema },
  about: { model: AboutSettings, key: "about", schema: aboutSchema },
};

type Ctx = { params: Promise<{ key: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const s = SINGLETONS[(await params).key];
    if (!s) return fail("Not found", 404);
    await connectDB();
    const doc = await s.model.findOne({ key: s.key }).lean();
    return ok(serialize(doc ?? {}));
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const s = SINGLETONS[(await params).key];
    if (!s) return fail("Not found", 404);
    const data = s.schema.parse(await readJson(req)) as Record<string, unknown>;
    await connectDB();
    const doc = await s.model
      .findOneAndUpdate(
        { key: s.key },
        { $set: toSetPaths(data), $setOnInsert: { key: s.key } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      )
      .lean();
    revalidatePublic();
    return ok(serialize(doc));
  } catch (err) {
    return handleError(err);
  }
}
