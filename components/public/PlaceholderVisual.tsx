import { cn } from "@/lib/utils/cn";

/**
 * Typographic stand-in shown when a project has no imagery yet, so the site
 * still looks intentional before media is uploaded.
 */
export function PlaceholderVisual({
  title,
  label,
  index,
  className,
}: {
  title: string;
  label?: string;
  index?: number;
  className?: string;
}) {
  // Deterministic warm tint per title so cards differ subtly.
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) % 360;
  const hue = 20 + (h % 30);
  return (
    <div
      className={cn("grain relative flex h-full w-full flex-col justify-between overflow-hidden p-6", className)}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, hsl(${hue} 30% 22%) 0%, hsl(${hue} 18% 10%) 55%, #0d0c0a 100%)`,
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <span className="label text-paper/60">{label}</span>
        {index !== undefined && <span className="label text-paper/40">{String(index + 1).padStart(2, "0")}</span>}
      </div>
      <span className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] italic leading-[0.9] text-paper/85">
        {title}
      </span>
    </div>
  );
}
