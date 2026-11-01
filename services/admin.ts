import "server-only";
import { connectDB } from "@/lib/db/connect";
import { serialize } from "@/lib/api";
import { AboutSettings, ContactMessage, HomepageSettings, Media, Project, SiteSettings } from "@/models";
import { getResource, PROJECT_POPULATE_FOR_ADMIN } from "./resources";
import { normaliseSections } from "./content";
import type { ContactMessageItem, HomepageSectionConfig, MediaItem } from "@/types";

type Item = Record<string, unknown> & { _id: string };

/** Full list (including drafts) for an admin resource. */
export async function adminList(resource: string): Promise<Item[]> {
  const cfg = getResource(resource);
  if (!cfg) return [];
  await connectDB();
  let q = cfg.model.find().sort(cfg.sort);
  if (cfg.populate) q = q.populate(cfg.populate as never);
  return serialize<Item[]>(await q.lean());
}

export async function adminProject(id: string): Promise<Item | null> {
  await connectDB();
  const doc = await Project.findById(id).populate(PROJECT_POPULATE_FOR_ADMIN).lean();
  return doc ? serialize<Item>(doc) : null;
}

export async function adminSingleton(key: "site" | "home" | "about"): Promise<Record<string, unknown>> {
  await connectDB();
  if (key === "site") {
    const doc = await SiteSettings.findOne({ key }).populate(["logo", "favicon", "cvFile", "seo.ogImage"]).lean();
    return serialize(doc ?? {});
  }
  if (key === "home") {
    const doc = await HomepageSettings.findOne({ key }).populate(["hero.image", "hero.video"]).lean();
    const data = serialize<Record<string, unknown>>(doc ?? {});
    return { ...data, sections: normaliseSections(data.sections as HomepageSectionConfig[] | undefined) };
  }
  const doc = await AboutSettings.findOne({ key }).populate(["portrait", "secondaryImage"]).lean();
  return serialize(doc ?? {});
}

export async function adminPhotos(): Promise<MediaItem[]> {
  await connectDB();
  return serialize(await Media.find({ inPhotography: true, kind: "image" }).sort({ photoOrder: 1, createdAt: -1 }).lean());
}

export async function adminMessages(): Promise<ContactMessageItem[]> {
  await connectDB();
  return serialize(await ContactMessage.find().sort({ createdAt: -1 }).limit(500).select("-ipHash -userAgent").lean());
}

export async function unreadCount(): Promise<number> {
  try {
    await connectDB();
    return await ContactMessage.countDocuments({ status: "new" });
  } catch {
    return 0;
  }
}

export async function dashboardData() {
  await connectDB();
  const [total, published, media, messages, unread, recentProjects, recentMessages] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ published: true }),
    Media.countDocuments(),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: "new" }),
    Project.find().sort({ updatedAt: -1 }).limit(5).select("title published updatedAt").lean(),
    ContactMessage.find({ status: { $ne: "archived" } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name service status createdAt")
      .lean(),
  ]);
  return {
    stats: { total, published, drafts: total - published, media, messages, unread },
    recentProjects: serialize<{ _id: string; title: string; published: boolean; updatedAt: string }[]>(recentProjects),
    recentMessages: serialize<{ _id: string; name: string; service: string; status: string; createdAt: string }[]>(recentMessages),
  };
}
