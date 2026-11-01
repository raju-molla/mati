import {
  Aperture,
  Camera,
  Clapperboard,
  Cpu,
  Film,
  Gamepad2,
  Megaphone,
  MonitorPlay,
  Palette,
  Scissors,
  Smartphone,
  Sparkles,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * A curated set of icons the admin can pick by name (keeps the bundle small
 * versus importing every Lucide icon).
 */
export const ICONS: Record<string, LucideIcon> = {
  Aperture,
  Camera,
  Clapperboard,
  Cpu,
  Film,
  Gamepad2,
  Megaphone,
  MonitorPlay,
  Palette,
  Scissors,
  Smartphone,
  Sparkles,
  Video,
  Wrench,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} aria-hidden="true" strokeWidth={1.4} />;
}
