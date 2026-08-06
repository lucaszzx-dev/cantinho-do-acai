import type { Category, Product } from '../types/domain'
import { ProductCard } from './ProductCard'

interface ProductSectionProps {
  category: Category
  products: Product[]
  onChoose: (product: Product) => void
}

export function ProductSection({ category, products, onChoose }: ProductSectionProps) {
  if (products.length === 0) return null
  return (
    <section className="product-section" id={category.id} aria-labelledby={`heading-${category.id}`}>
      <div className="product-section__heading">
        <h2 className="product-section__title" id={`heading-${category.id}`}>
          {category.name}
        </h2>
        {category.subtitle && (
          <p className="product-section__subtitle">{category.subtitle}</p>
        )}
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onChoose={onChoose} />
        ))}
      </div>
    </section>
  )
}
