import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db/connect";
import { serialize } from "@/lib/api";
import {
  AboutSettings,
  Category,
  Education,
  Experience,
  HomepageSettings,
  Media,
  Project,
  Service,
  SiteSettings,
  Skill,
  SkillCategory,
} from "@/models";
import { DEFAULT_ABOUT, DEFAULT_HOME, DEFAULT_SECTIONS, DEFAULT_SITE } from "@/lib/defaults";
import type {
  AboutData,
  CategoryItem,
  EducationItem,
  ExperienceItem,
  HomepageData,
  HomepageSectionConfig,
  MediaItem,
  ProjectItem,
  ServiceItem,
  SiteSettingsData,
  SkillCategoryItem,
  SkillGroupItem,
  SkillItem,
} from "@/types";

/**
 * Public read-side data access. Every function degrades gracefully: if the
 * database is unreachable (e.g. during a build without MONGODB_URI) it logs
 * and returns empty data so pages still render.
 */
async function safe<T>(label: string, fallback: T, fn: () => Promise<T>): Promise<T> {
  try {
    await connectDB();
    return await fn();
  } catch (err) {
    console.error(`[content:${label}]`, (err as Error).message);
    return fallback;
  }
}

function merge<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) return (override ?? base) as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    if (v === undefined) continue;
    const b = (base as Record<string, unknown>)?.[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) && v && typeof v === "object" && !Array.isArray(v) ? merge(b, v) : v;
  }
  return out as T;
}

export const PROJECT_POPULATE = [
  { path: "category" },
  { path: "coverImage" },
  { path: "thumbnail" },
  { path: "gallery" },
  { path: "videos" },
  { path: "sections.media" },
  { path: "seo.ogImage" },
];

const CARD_POPULATE = [{ path: "category" }, { path: "coverImage" }, { path: "thumbnail" }];

/** Remove dangling refs (deleted media) from populated arrays. */
function tidyProject(p: ProjectItem): ProjectItem {
  return {
    ...p,
    gallery: (p.gallery ?? []).filter(Boolean),
    videos: (p.videos ?? []).filter(Boolean),
    sections: (p.sections ?? []).map((s) => ({ ...s, media: (s.media ?? []).filter(Boolean) })),
    seo: p.seo ?? { title: "", description: "", ogImage: null },
  };
}

/* ───────── Settings ───────── */

export const getSiteSettings = cache(async (): Promise<SiteSettingsData> =>
  safe("site", DEFAULT_SITE, async () => {
    const doc = await SiteSettings.findOne({ key: "site" })
      .populate(["logo", "favicon", "cvFile", "seo.ogImage"])
      .lean();
    return doc ? merge(DEFAULT_SITE, serialize(doc)) : DEFAULT_SITE;
  })
);

export function normaliseSections(sections: HomepageSectionConfig[] | undefined): HomepageSectionConfig[] {
  const list = (sections ?? []).filter((s) => DEFAULT_SECTIONS.some((d) => d.key === s.key));
  const missing = DEFAULT_SECTIONS.filter((d) => !list.some((s) => s.key === d.key));
  return [...list.map((s) => ({ ...DEFAULT_SECTIONS.find((d) => d.key === s.key)!, ...s })), ...missing];
}

export const getHomepage = cache(async (): Promise<HomepageData> =>
  safe("home", DEFAULT_HOME, async () => {
    const doc = await HomepageSettings.findOne({ key: "home" })
      .populate(["hero.image", "hero.video"])
      .populate({ path: "featuredProjects", match: { published: true }, populate: CARD_POPULATE })
      .lean();
    if (!doc) return DEFAULT_HOME;
    const data = merge(DEFAULT_HOME, serialize(doc));
    return {
      ...data,
      featuredProjects: (data.featuredProjects ?? []).filter(Boolean).map(tidyProject),
      sections: normaliseSections(data.sections),
    };
  })
);

export const getAbout = cache(async (): Promise<AboutData> =>
  safe("about", DEFAULT_ABOUT, async () => {
    const doc = await AboutSettings.findOne({ key: "about" }).populate(["portrait", "secondaryImage"]).lean();
    return doc ? merge(DEFAULT_ABOUT, serialize(doc)) : DEFAULT_ABOUT;
  })
);

/* ───────── Projects ───────── */

export const getCategories = cache(async (): Promise<CategoryItem[]> =>
  safe("categories", [], async () =>
    serialize<CategoryItem[]>(
      await Category.find({ published: true }).sort({ displayOrder: 1, name: 1 }).populate("coverImage").lean()
    )
  )
);

/** Categories that actually contain at least one published project. */
export const getActiveCategories = cache(async (): Promise<CategoryItem[]> =>
  safe("activeCategories", [], async () => {
    const [cats, used] = await Promise.all([getCategories(), Project.distinct("category", { published: true })]);
    const usedSet = new Set(used.map(String));
    return cats.filter((c) => usedSet.has(c._id));
  })
);

export const getPublishedProjects = cache(
  async (opts: { categorySlug?: string; featured?: boolean; limit?: number } = {}): Promise<ProjectItem[]> =>
    safe("projects", [], async () => {
      const filter: Record<string, unknown> = { published: true };
      if (opts.featured) filter.featured = true;
      if (opts.categorySlug) {
        const cat = await Category.findOne({ slug: opts.categorySlug, published: true }).select("_id").lean();
        if (!cat) return [];
        filter.category = cat._id;
      }
      let q = Project.find(filter)
        .select("-fullDescription -challenge -process -outcome -sections")
        .sort({ displayOrder: 1, createdAt: -1 })
        .populate(CARD_POPULATE);
      if (opts.limit) q = q.limit(opts.limit);
      return serialize<ProjectItem[]>(await q.lean()).map(tidyProject);
    })
);

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectItem | null> =>
  safe("project", null, async () => {
    const doc = await Project.findOne({ slug, published: true }).populate(PROJECT_POPULATE).lean();
    return doc ? tidyProject(serialize<ProjectItem>(doc)) : null;
  })
);

/** Admin preview: loads by id regardless of published state. Caller must authorise. */
export async function getProjectForPreview(id: string): Promise<ProjectItem | null> {
  await connectDB();
  const doc = await Project.findById(id).populate(PROJECT_POPULATE).lean();
  return doc ? tidyProject(serialize<ProjectItem>(doc)) : null;
}

export async function getNextProject(current: ProjectItem): Promise<ProjectItem | null> {
  return safe("nextProject", null, async () => {
    const all = await Project.find({ published: true })
      .select("title slug subtitle category coverImage thumbnail year displayOrder createdAt")
      .sort({ displayOrder: 1, createdAt: -1 })
      .populate(CARD_POPULATE)
      .lean();
    if (all.length < 2) return null;
    const i = all.findIndex((p) => String(p._id) === current._id);
    const next = all[(i + 1) % all.length];
    return next ? tidyProject(serialize<ProjectItem>(next)) : null;
  });
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  return safe("slugs", [], async () =>
    serialize(await Project.find({ published: true }).select("slug updatedAt").lean())
  );
}

/* ───────── Photography ───────── */

export const getPhotography = cache(async (opts: { featuredOnly?: boolean; limit?: number } = {}): Promise<MediaItem[]> =>
  safe("photography", [], async () => {
    const filter: Record<string, unknown> = { inPhotography: true, kind: "image" };
    if (opts.featuredOnly) filter.photoFeatured = true;
    let q = Media.find(filter).sort({ photoOrder: 1, createdAt: -1 });
    if (opts.limit) q = q.limit(opts.limit);
    return serialize<MediaItem[]>(await q.lean());
  })
);

/* ───────── CV content ───────── */

export const getExperience = cache(async (): Promise<ExperienceItem[]> =>
  safe("experience", [], async () =>
    serialize<ExperienceItem[]>(await Experience.find({ published: true }).sort({ displayOrder: 1 }).lean())
  )
);

export const getEducation = cache(async (): Promise<EducationItem[]> =>
  safe("education", [], async () =>
    serialize<EducationItem[]>(await Education.find({ published: true }).sort({ displayOrder: 1 }).lean())
  )
);

export const getSkillGroups = cache(async (): Promise<SkillGroupItem[]> =>
  safe("skills", [], async () => {
    const [cats, skills] = await Promise.all([
      SkillCategory.find({ published: true }).sort({ displayOrder: 1 }).lean(),
      Skill.find({ published: true }).sort({ displayOrder: 1 }).populate("icon").lean(),
    ]);
    const c = serialize<SkillCategoryItem[]>(cats);
    const s = serialize<(Omit<SkillItem, "category"> & { category: string | null })[]>(skills);
    return c
      .map((category) => ({
        category,
        skills: s.filter((sk) => sk.category === category._id).map((sk) => ({ ...sk, category })),
      }))
      .filter((g) => g.skills.length > 0);
  })
);

export const getServices = cache(async (): Promise<ServiceItem[]> =>
  safe("services", [], async () =>
    serialize<ServiceItem[]>(await Service.find({ published: true }).sort({ displayOrder: 1 }).populate("image").lean())
  )
);
