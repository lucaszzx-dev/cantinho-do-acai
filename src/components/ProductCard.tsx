import { useState } from 'react'
import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  onChoose: (product: Product) => void
}

export function ProductCard({ product, onChoose }: ProductCardProps) {
  const priceLabel = `${product.fromPrice ? 'A partir de ' : ''}${formatCurrency(product.price)}`
  const [expanded, setExpanded] = useState(false)

  return (
    <article className={`product-card product-card--${product.category} ${product.available ? '' : 'product-card--disabled'} ${expanded ? 'is-expanded' : ''}`} tabIndex={0} onClick={() => setExpanded((value) => !value)}>
      <ProductImage alt={product.name} src={product.image} />
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        {product.subtitle && (
          <p className="product-card__subtitle">{product.subtitle}</p>
        )}
        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}
        <div className="product-card__footer">
          <span className="product-card__price">{priceLabel}</span>
          {product.available ? (
            <button
              type="button"
              className="button button--primary product-card__choose"
              onClick={(event) => { event.stopPropagation(); onChoose(product) }}
            >
              {product.variants.length > 0 || product.optionGroups.length > 0
                ? 'Montar'
                : 'Escolher'}
            </button>
          ) : (
            <span className="product-card__unavailable">Indisponível</span>
          )}
        </div>
      </div>
    </article>
  )
}
