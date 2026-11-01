"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, Play } from "lucide-react";
import type { HomepageData } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { parseVideoEmbed } from "@/lib/utils/media";
import { VideoModal } from "./VideoModal";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ hero, location }: { hero: HomepageData["hero"]; location?: string }) {
  const reduce = useReducedMotion();
  const roles = hero.roles.filter(Boolean);
  const [roleIndex, setRoleIndex] = useState(0);
  const [showreelOpen, setShowreelOpen] = useState(false);

  useEffect(() => {
    if (reduce || roles.length < 2) return;
    const t = setInterval(() => setRoleIndex((i) => (i + 1) % roles.length), 2800);
    return () => clearInterval(t);
  }, [reduce, roles.length]);

  const titleWords = (hero.title || "").split(" ").filter(Boolean);
  const showreel = parseVideoEmbed(hero.showreelUrl);
  const bgVideo = (hero.mediaType === "video" || hero.mediaType === "showreel") && hero.video?.url ? hero.video : null;
  const bgImage = hero.mediaType === "image" ? hero.image : null;
  const hasMedia = Boolean(bgVideo || bgImage?.url);

  return (
    <section className="grain relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-10 pt-28 md:pb-14">
      {/* Background */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {bgVideo ? (
          <video
            className="size-full object-cover"
            src={bgVideo.url}
            poster={bgVideo.posterUrl || hero.image?.url || undefined}
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : bgImage?.url ? (
          <SmartImage media={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div
            className="size-full"
            style={{
              background: `radial-gradient(90% 70% at 75% 20%, ${hero.gradientTo} 0%, ${hero.gradientFrom} 60%, #0d0c0a 100%)`,
            }}
          />
        )}
        {hasMedia && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30"
            style={{ opacity: Math.min(0.9, Math.max(0, hero.overlayOpacity / 100)) + 0.1 }}
          />
        )}
      </div>

      <div className="container-x">
        <div className="mb-8 flex items-center justify-between md:mb-12">
          {hero.eyebrow && (
            <motion.p
              className="label text-paper/80"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              {hero.eyebrow}
            </motion.p>
          )}
          {location && <p className="label hidden text-paper/60 md:block">{location}</p>}
        </div>

        <h1 className="text-display font-semibold uppercase">
          {titleWords.map((w, i) => (
            <span key={`${w}-${i}`} className="block overflow-hidden pb-[0.04em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-10 border-t border-line pt-6 md:mt-14 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            {roles.length > 0 && (
              <p className="relative h-[1.2em] overflow-hidden font-serif text-3xl italic md:text-4xl" aria-live="off">
                <span className="sr-only">{roles.join(", ")}</span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={roleIndex}
                    className="absolute inset-0 text-accent"
                    aria-hidden="true"
                    initial={reduce ? false : { y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.6, ease }}
                  >
                    {roles[roleIndex]}
                  </motion.span>
                </AnimatePresence>
              </p>
            )}
            {hero.subtitle && <p className="mt-3 text-sm text-paper-dim">{hero.subtitle}</p>}
          </div>
          <div className="md:col-span-7 md:pl-10">
            {hero.description && <p className="max-w-xl text-lg leading-relaxed text-paper-dim md:text-xl">{hero.description}</p>}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {hero.primaryCtaLabel && (
                <Link href={hero.primaryCtaHref || "/work"} className="btn-primary">
                  {hero.primaryCtaLabel}
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                </Link>
              )}
              {hero.secondaryCtaLabel && (
                <Link href={hero.secondaryCtaHref || "/contact"} className="btn-ghost">
                  {hero.secondaryCtaLabel}
                </Link>
              )}
              {hero.mediaType === "showreel" && (showreel || bgVideo) && (
                <button type="button" onClick={() => setShowreelOpen(true)} className="btn group text-paper">
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong transition-colors group-hover:border-accent group-hover:text-accent">
                    <Play className="size-4 fill-current" aria-hidden="true" />
                  </span>
                  Play showreel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <VideoModal
        open={showreelOpen}
        onClose={() => setShowreelOpen(false)}
        embedUrl={showreel?.embedUrl}
        mp4Url={bgVideo?.url}
        title="Showreel"
      />
    </section>
  );
}
