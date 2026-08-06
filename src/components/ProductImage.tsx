import { useState } from 'react'

interface ProductImageProps {
  alt: string
  src?: string
  /** Visual variant: card thumbnail vs modal hero. */
  variant?: 'card' | 'hero'
  eager?: boolean
}

/**
 * Product image with:
 * - a consistent aspect ratio;
 * - a discreet loading shimmer;
 * - an elegant placeholder fallback on error or when no image is set;
 * - support for local or remote URLs later.
 */
export function ProductImage({ alt, src, variant = 'card', eager = false }: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(src ? 'loading' : 'error')

  const showPlaceholder = !src || status === 'error'

  return (
    <div className={`product-image product-image--${variant}`}>
      {src && status !== 'error' && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
        />
      )}
      {status === 'loading' && <span className="product-image__shimmer" aria-hidden="true" />}
      {showPlaceholder && (
        <span className="product-image__placeholder" aria-hidden="true">
          🍧
        </span>
      )}
    </div>
  )
}
