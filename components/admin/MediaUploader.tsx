"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud, XCircle } from "lucide-react";
import type { MediaItem, MediaKind } from "@/types";
import { ACCEPT, uploadFile } from "./upload";
import { cn } from "@/lib/utils/cn";

type Job = { id: number; name: string; pct: number; state: "uploading" | "done" | "error"; error?: string };

/** Drag-and-drop uploader with per-file progress. */
export function MediaUploader({
  accept,
  multiple = true,
  onUploaded,
  compact,
}: {
  accept?: MediaKind[];
  multiple?: boolean;
  onUploaded: (items: MediaItem[]) => void;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const seq = useRef(0);
  const kinds = accept ?? (["image", "video", "document"] as MediaKind[]);
  const acceptAttr = kinds.map((k) => ACCEPT[k]).join(",");

  const handle = async (files: FileList | File[]) => {
    const list = Array.from(files).slice(0, multiple ? 30 : 1);
    const done: MediaItem[] = [];
    await Promise.all(
      list.map(async (file) => {
        const id = ++seq.current;
        setJobs((j) => [...j, { id, name: file.name, pct: 0, state: "uploading" }]);
        try {
          const item = await uploadFile(file, {
            onProgress: (pct) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, pct } : x))),
          });
          if (!kinds.includes(item.kind)) throw new Error(`${file.name}: not allowed here`);
          done.push(item);
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, pct: 100, state: "done" } : x)));
        } catch (e) {
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, state: "error", error: (e as Error).message } : x)));
        }
      })
    );
    if (done.length) onUploaded(done);
    setTimeout(() => setJobs((j) => j.filter((x) => x.state === "error")), 2500);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) handle(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors",
          compact ? "px-4 py-5" : "px-6 py-10",
          drag ? "border-zinc-900 bg-zinc-100" : "border-zinc-300 bg-zinc-50 hover:border-zinc-400"
        )}
      >
        <UploadCloud className="size-6 text-zinc-500" aria-hidden="true" />
        <p className="text-sm font-medium text-zinc-800">
          Drop {multiple ? "files" : "a file"} here or <span className="underline">browse</span>
        </p>
        <p className="text-xs text-zinc-500">
          {kinds.includes("image") && "JPG, PNG, WEBP, AVIF (20 MB) "}
          {kinds.includes("video") && "· MP4 (200 MB) "}
          {kinds.includes("document") && "· PDF (15 MB)"}
        </p>
        <input
          ref={input}
          type="file"
          className="sr-only"
          accept={acceptAttr}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) handle(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {jobs.length > 0 && (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {jobs.map((j) => (
            <li key={j.id} className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                {j.state === "uploading" && <Loader2 className="size-4 animate-spin text-zinc-500" />}
                {j.state === "done" && <CheckCircle2 className="size-4 text-emerald-600" />}
                {j.state === "error" && <XCircle className="size-4 text-red-600" />}
                <span className="flex-1 truncate">{j.name}</span>
                {j.state === "uploading" && <span className="text-xs text-zinc-500">{j.pct}%</span>}
                {j.state === "error" && (
                  <button
                    type="button"
                    className="text-xs text-zinc-500 underline"
                    onClick={() => setJobs((all) => all.filter((x) => x.id !== j.id))}
                  >
                    Dismiss
                  </button>
                )}
              </div>
              {j.state === "uploading" && (
                <div className="mt-2 h-1 overflow-hidden rounded bg-zinc-100">
                  <div className="h-full bg-zinc-900 transition-all" style={{ width: `${j.pct}%` }} />
                </div>
              )}
              {j.error && <p className="mt-1 text-xs text-red-600">{j.error}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
