import { clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  isLarge?: boolean
  className?: string
  "data-testid"?: string
}

/**
 * NOOORS Thumbnail — aspect-[3/4] cream-bg frame with hover zoom.
 * Used as the .shop-card__img-wrap → NoorsMotion adds 3D tilt automatically.
 */
const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "full",
  isLarge,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <div
      suppressHydrationWarning
      className={clx(
        "shop-card__img-wrap relative w-full overflow-hidden bg-cream",
        isLarge ? "aspect-[3/4.5]" : "aspect-[3/4]",
        size === "square" && "aspect-square",
        size === "small" && "w-[180px]",
        size === "medium" && "w-[290px]",
        size === "large" && "w-[440px]",
        size === "full" && "w-full",
        className
      )}
      data-testid={dataTestid}
    >
      {initialImage ? (
        <Image
          src={initialImage}
          alt="Thumbnail"
          className="absolute inset-0 object-cover object-center transition-transform [transition-duration:1200ms] ease-silk group-hover:scale-[1.06]"
          draggable={false}
          quality={70}
          sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
          fill
        />
      ) : (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center text-smoke/50">
          <PlaceholderImage size={24} />
        </div>
      )}
    </div>
  )
}

export default Thumbnail
