"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader, isCloudinary } from "@/lib/utils/media";
import type { MediaItem } from "@/types";

type Props = Omit<ImageProps, "src" | "alt" | "width" | "height"> & {
  media: Pick<MediaItem, "url" | "alt" | "width" | "height"> | null | undefined;
  alt?: string;
  /** When true, fills the parent (which must be position: relative). */
  fill?: boolean;
};

/**
 * next/image wrapper: Cloudinary assets are resized/formatted by Cloudinary
 * (f_auto,q_auto) via a custom loader; other sources use Next's optimiser.
 */
export function SmartImage({ media, alt, fill, sizes, ...rest }: Props) {
  if (!media?.url) return null;
  const loader = isCloudinary(media.url) ? cloudinaryLoader : undefined;
  const altText = alt ?? media.alt ?? "";
  if (fill || !media.width || !media.height) {
    return <Image src={media.url} alt={altText} fill sizes={sizes ?? "100vw"} loader={loader} {...rest} />;
  }
  return (
    <Image
      src={media.url}
      alt={altText}
      width={media.width}
      height={media.height}
      sizes={sizes ?? "100vw"}
      loader={loader}
      {...rest}
    />
  );
}
