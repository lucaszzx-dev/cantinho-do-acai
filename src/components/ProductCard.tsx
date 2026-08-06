import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { ProductImage } from './ProductImage'

interface ProductCardProps {
  product: Product
  onChoose: (product: Product) => void
}

export function ProductCard({ product, onChoose }: ProductCardProps) {
  const priceLabel = `${product.fromPrice ? 'A partir de ' : ''}${formatCurrency(product.price)}`

  return (
    <article className={`product-card ${product.available ? '' : 'product-card--disabled'}`}>
      <ProductImage alt={product.name} src={product.image} />
      <div className="product-card__body">
        <div className="product-card__title-row">
          <h3 className="product-card__name">{product.name}</h3>
          <span className="product-card__price">{priceLabel}</span>
        </div>
        {product.subtitle && (
          <p className="product-card__subtitle">{product.subtitle}</p>
        )}
        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}
        {product.available ? (
          <button
            type="button"
            className="button button--primary product-card__choose"
            onClick={() => onChoose(product)}
          >
            {product.category === 'monte-seu-acai' ? 'Montar' : 'Escolher'}
          </button>
        ) : (
          <p className="product-card__unavailable">Indisponível</p>
        )}
      </div>
    </article>
  )
}
