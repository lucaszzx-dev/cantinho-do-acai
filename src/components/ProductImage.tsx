interface ProductImageProps {
  alt: string
  src?: string
}

/**
 * Product thumbnail with a graceful placeholder fallback when no real image
 * is available, so a broken image never breaks the layout.
 */
export function ProductImage({ alt, src }: ProductImageProps) {
  if (src) {
    return (
      <div className="product-card__image">
        <img src={src} alt={alt} loading="lazy" />
      </div>
    )
  }
  return (
    <div className="product-card__image product-card__image--placeholder" aria-hidden="true">
      <span>🍧</span>
    </div>
  )
}
