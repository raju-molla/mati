"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { api, ApiError } from "./api";
import { useFeedback } from "./Feedback";
import { FieldRenderer } from "./fields/FieldRenderer";
import { getPath, setPath, toPayload } from "./fields/types";
import { SINGLETON_CONFIGS } from "./singleton-configs";

/** Form for one-off documents (site settings, homepage, about, SEO, social). */
export function SingletonForm({ configKey, initial }: { configKey: string; initial: Record<string, unknown> }) {
  const cfg = SINGLETON_CONFIGS[configKey]!;
  const { toast } = useFeedback();
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fields = cfg.groups.flatMap((g) => g.fields);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api(`/api/admin/singletons/${cfg.endpoint}`, { method: "PUT", body: toPayload(fields, values) });
      toast("Saved — the website has been updated");
      setDirty(false);
    } catch (err) {
      if (err instanceof ApiError && err.payload.fieldErrors) setErrors(err.payload.fieldErrors as Record<string, string>);
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{cfg.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500">{cfg.description}</p>
        </div>
        {cfg.previewPath && (
          <a href={cfg.previewPath} target="_blank" rel="noopener noreferrer" className="a-btn-secondary self-start">
            <ExternalLink className="size-4" /> View page
          </a>
        )}
      </div>
      <div className="space-y-6">
        {cfg.groups.map((g) => (
          <section key={g.title} className="a-card p-5 sm:p-6">
            <h2 className="text-base font-semibold">{g.title}</h2>
            {g.description && <p className="mt-1 text-sm text-zinc-500">{g.description}</p>}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {g.fields.map((f) => (
                <FieldRenderer
                  key={f.name}
                  field={f}
                  value={getPath(values, f.name)}
                  error={errors[f.name]}
                  onChange={(v) => {
                    setDirty(true);
                    setValues((s) => setPath(s, f.name, v));
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex items-center justify-end gap-3 border-t border-zinc-200 bg-zinc-50/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        {dirty && <span className="text-sm text-amber-600">Unsaved changes</span>}
        <button type="submit" className="a-btn-primary" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </button>
      </div>
    </form>
  );
}
