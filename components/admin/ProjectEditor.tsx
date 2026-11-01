"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Eye, Loader2, Trash2 } from "lucide-react";
import { api, ApiError } from "./api";
import { useFeedback } from "./Feedback";
import { FieldRenderer } from "./fields/FieldRenderer";
import { getPath, setPath, toPayload, type FieldGroup } from "./fields/types";
import { slugify } from "@/lib/utils/slugify";

const TOOL_SUGGESTIONS = [
  "Unity",
  "Unreal Engine",
  "C#",
  "Python",
  "DaVinci Resolve",
  "Adobe Premiere Pro",
  "After Effects",
  "Photoshop",
  "CapCut",
  "Blender",
];

const GROUPS: FieldGroup[] = [
  {
    title: "Basics",
    fields: [
      { name: "title", label: "Project title", type: "text", required: true, full: true },
      { name: "subtitle", label: "Subtitle", type: "text", full: true, help: "One line shown under the title on the project page." },
      { name: "category", label: "Category", type: "relation", resource: "categories", labelKey: "name", emptyLabel: "— Choose a category —" },
      { name: "year", label: "Year", type: "text", placeholder: "2024" },
      { name: "role", label: "My role", type: "text", placeholder: "e.g. Designer & developer" },
      { name: "client", label: "Client (optional)", type: "text" },
      { name: "duration", label: "Duration (optional)", type: "text", placeholder: "e.g. 6 weeks" },
    ],
  },
  {
    title: "Story",
    description: "Only the fields you fill in are shown. Leave a blank line between paragraphs.",
    fields: [
      { name: "shortDescription", label: "Short description", type: "textarea", rows: 2, full: true, maxLength: 400, help: "Used on project cards and in search results." },
      { name: "fullDescription", label: "Overview", type: "textarea", rows: 6, full: true },
      { name: "challenge", label: "Challenge", type: "textarea", rows: 4, full: true },
      { name: "process", label: "Process", type: "textarea", rows: 4, full: true },
      { name: "outcome", label: "Outcome", type: "textarea", rows: 4, full: true },
    ],
  },
  {
    title: "Images & video",
    fields: [
      { name: "coverImage", label: "Cover image (top of the project page)", type: "media", accept: "image", full: true },
      { name: "thumbnail", label: "Card image (optional — uses the cover if empty)", type: "media", accept: "image", full: true },
      { name: "gallery", label: "Gallery", type: "mediaList", accept: "image", full: true },
      { name: "embeddedVideo", label: "YouTube / Vimeo link", type: "url", full: true, placeholder: "https://www.youtube.com/watch?v=…" },
      { name: "videos", label: "Uploaded videos (MP4)", type: "mediaList", accept: "video", full: true },
    ],
  },
  {
    title: "Tools & links",
    fields: [
      { name: "technologies", label: "Technologies", type: "list", suggestions: TOOL_SUGGESTIONS },
      { name: "tools", label: "Tools / software", type: "list", suggestions: TOOL_SUGGESTIONS },
      { name: "projectURL", label: "Project link (optional)", type: "url" },
      { name: "githubURL", label: "GitHub link (optional)", type: "url" },
    ],
  },
  {
    title: "Extra content blocks",
    description: "Optional — add text, images, galleries, videos or quotes in any order after the main story.",
    fields: [{ name: "sections", label: "Blocks", type: "projectSections", full: true }],
  },
  {
    title: "Search & sharing",
    description: "Optional. If empty, the title, short description and cover image are used.",
    fields: [
      { name: "slug", label: "URL", type: "text", help: "The address of this project: /work/<url>. Lowercase letters, numbers and hyphens.", full: true },
      { name: "seo.title", label: "Search title", type: "text", maxLength: 70 },
      { name: "seo.description", label: "Search description", type: "textarea", rows: 2, maxLength: 170 },
      { name: "seo.ogImage", label: "Share image", type: "media", accept: "image", full: true },
    ],
  },
];

const SIDEBAR_FIELDS = [
  { name: "published", label: "Published (visible on the website)", type: "toggle" as const },
  { name: "featured", label: "Featured on the homepage", type: "toggle" as const },
];

const ALL_FIELDS = [...GROUPS.flatMap((g) => g.fields), ...SIDEBAR_FIELDS];

const BLANK = {
  title: "",
  slug: "",
  subtitle: "",
  category: null,
  shortDescription: "",
  fullDescription: "",
  challenge: "",
  process: "",
  outcome: "",
  coverImage: null,
  thumbnail: null,
  gallery: [],
  videos: [],
  embeddedVideo: "",
  sections: [],
  technologies: [],
  tools: [],
  role: "",
  client: "",
  year: "",
  duration: "",
  projectURL: "",
  githubURL: "",
  featured: false,
  published: false,
  seo: { title: "", description: "", ogImage: null },
};

export function ProjectEditor({ project }: { project: (Record<string, unknown> & { _id: string }) | null }) {
  const router = useRouter();
  const { toast, confirm } = useFeedback();
  const [values, setValues] = useState<Record<string, unknown>>(() => ({ ...BLANK, ...(project ?? {}) }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  const set = (name: string, v: unknown) => {
    setDirty(true);
    setValues((s) => {
      let next = setPath(s, name, v);
      if (name === "slug") setSlugTouched(true);
      if (name === "title" && !slugTouched) next = setPath(next, "slug", slugify(String(v)));
      return next;
    });
  };

  const save = async (publish?: boolean) => {
    setSaving(true);
    setErrors({});
    try {
      const body = toPayload(ALL_FIELDS, values);
      if (publish !== undefined) body.published = publish;
      if (project) {
        await api(`/api/admin/projects/${project._id}`, { method: "PATCH", body });
        if (publish !== undefined) setValues((s) => ({ ...s, published: publish }));
        toast(publish ? "Project published" : "Project saved");
        setDirty(false);
        router.refresh();
      } else {
        const created = await api<{ _id: string }>("/api/admin/projects", { method: "POST", body });
        toast("Project created");
        setDirty(false);
        router.replace(`/admin/projects/${created._id}`);
      }
    } catch (e) {
      if (e instanceof ApiError && e.payload.fieldErrors) setErrors(e.payload.fieldErrors as Record<string, string>);
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!project) return;
    const ok = await confirm({
      title: "Delete this project?",
      body: (
        <>
          <strong>{String(values.title)}</strong> and its case study will be permanently removed. Images stay in your Media
          Library.
        </>
      ),
      confirmLabel: "Delete project",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/api/admin/projects/${project._id}`, { method: "DELETE" });
      toast("Project deleted");
      router.push("/admin/projects");
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const published = Boolean(values.published);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/admin/projects" className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="size-4" /> All projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{project ? String(values.title) || "Untitled project" : "New project"}</h1>
        </div>
        <span
          className={
            published
              ? "self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
              : "self-start rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600"
          }
        >
          {published ? "Published" : "Draft — not visible to visitors"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <section key={g.title} className="a-card p-5 sm:p-6">
              <h2 className="text-base font-semibold">{g.title}</h2>
              {g.description && <p className="mt-1 text-sm text-zinc-500">{g.description}</p>}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <FieldRenderer key={f.name} field={f} value={getPath(values, f.name)} onChange={(v) => set(f.name, v)} error={errors[f.name]} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="a-card space-y-4 p-5">
            {SIDEBAR_FIELDS.map((f) => (
              <FieldRenderer key={f.name} field={f} value={getPath(values, f.name)} onChange={(v) => set(f.name, v)} />
            ))}
            <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4">
              <button type="submit" className="a-btn-primary w-full" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {project ? "Save changes" : "Create project"}
              </button>
              {project && !published && (
                <button type="button" className="a-btn-secondary w-full" disabled={saving} onClick={() => save(true)}>
                  Save &amp; publish
                </button>
              )}
              {project && (
                <a
                  href={`/admin/preview/projects/${project._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="a-btn-secondary w-full"
                  onClick={(e) => {
                    if (dirty) {
                      e.preventDefault();
                      toast("Save your changes first so the preview is up to date.", "info");
                    }
                  }}
                >
                  <Eye className="size-4" /> Preview
                </a>
              )}
              {project && published && (
                <a href={`/work/${String(values.slug)}`} target="_blank" rel="noopener noreferrer" className="a-btn-secondary w-full">
                  <ExternalLink className="size-4" /> View live page
                </a>
              )}
            </div>
            {dirty && <p className="text-xs text-amber-600">You have unsaved changes.</p>}
          </div>
          {project && (
            <button type="button" onClick={remove} className="a-btn w-full text-red-600 hover:bg-red-50">
              <Trash2 className="size-4" /> Delete project
            </button>
          )}
        </aside>
      </div>
    </form>
  );
}
