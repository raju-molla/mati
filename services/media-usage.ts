import "server-only";
import { Types } from "mongoose";
import { AboutSettings, Category, HomepageSettings, Project, Service, SiteSettings, Skill } from "@/models";

/**
 * Lists everywhere a media item is referenced, so the admin can be warned
 * before deleting something that's in use.
 */
export async function findMediaUsage(mediaId: string): Promise<string[]> {
  const id = new Types.ObjectId(mediaId);
  const usage: string[] = [];

  const projects = await Project.find({
    $or: [
      { coverImage: id },
      { thumbnail: id },
      { gallery: id },
      { videos: id },
      { "sections.media": id },
      { "seo.ogImage": id },
    ],
  })
    .select("title")
    .lean();
  projects.forEach((p) => usage.push(`Project: ${p.title}`));

  const [cats, services, skills, site, home, about] = await Promise.all([
    Category.find({ coverImage: id }).select("name").lean(),
    Service.find({ image: id }).select("title").lean(),
    Skill.find({ icon: id }).select("name").lean(),
    SiteSettings.findOne({
      $or: [{ logo: id }, { favicon: id }, { cvFile: id }, { "seo.ogImage": id }],
    })
      .select("_id")
      .lean(),
    HomepageSettings.findOne({ $or: [{ "hero.image": id }, { "hero.video": id }] }).select("_id").lean(),
    AboutSettings.findOne({ $or: [{ portrait: id }, { secondaryImage: id }] }).select("_id").lean(),
  ]);
  cats.forEach((c) => usage.push(`Category: ${c.name}`));
  services.forEach((s) => usage.push(`Service: ${s.title}`));
  skills.forEach((s) => usage.push(`Skill icon: ${s.name}`));
  if (site) usage.push("Site settings (logo, favicon, CV or share image)");
  if (home) usage.push("Homepage hero");
  if (about) usage.push("About page");
  return usage;
}

/** Remove references to a deleted media item so pages don't point at missing files. */
export async function detachMedia(mediaId: string) {
  const id = new Types.ObjectId(mediaId);
  await Promise.all([
    Project.updateMany({ coverImage: id }, { $set: { coverImage: null } }),
    Project.updateMany({ thumbnail: id }, { $set: { thumbnail: null } }),
    Project.updateMany({ "seo.ogImage": id }, { $set: { "seo.ogImage": null } }),
    Project.updateMany({}, { $pull: { gallery: id, videos: id, "sections.$[].media": id } }),
    Category.updateMany({ coverImage: id }, { $set: { coverImage: null } }),
    Service.updateMany({ image: id }, { $set: { image: null } }),
    Skill.updateMany({ icon: id }, { $set: { icon: null } }),
    SiteSettings.updateMany({ logo: id }, { $set: { logo: null } }),
    SiteSettings.updateMany({ favicon: id }, { $set: { favicon: null } }),
    SiteSettings.updateMany({ cvFile: id }, { $set: { cvFile: null } }),
    SiteSettings.updateMany({ "seo.ogImage": id }, { $set: { "seo.ogImage": null } }),
    HomepageSettings.updateMany({ "hero.image": id }, { $set: { "hero.image": null } }),
    HomepageSettings.updateMany({ "hero.video": id }, { $set: { "hero.video": null } }),
    AboutSettings.updateMany({ portrait: id }, { $set: { portrait: null } }),
    AboutSettings.updateMany({ secondaryImage: id }, { $set: { secondaryImage: null } }),
  ]);
}
