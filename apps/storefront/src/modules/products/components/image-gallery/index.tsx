import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

/**
 * Elora PDP gallery — cream-bg frames, aspect-[3/4], stacked vertically.
 */
const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (!images.length) return null

  return (
    <div className="flex flex-col gap-6 w-full">
      {images.map((image, index) => (
        <div
          key={image.id}
          id={image.id}
          className="product-card__img-wrap clip-reveal relative aspect-[3/4] w-full bg-cream overflow-hidden"
        >
          {!!image.url && (
            <Image
              src={image.url}
              priority={index === 0}
              alt={`Elora — product image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 60vw"
              className="object-cover object-center transition-transform duration-[1500ms] ease-silk"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default ImageGallery
