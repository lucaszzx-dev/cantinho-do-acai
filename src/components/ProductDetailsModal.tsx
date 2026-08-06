import { useCart } from '../hooks/useCart'
import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { ProductImage } from './ProductImage'

interface ProductDetailsModalProps {
  product: Product
  onClose: () => void
  onAdded: () => void
}

export function ProductDetailsModal({ product, onClose, onAdded }: ProductDetailsModalProps) {
  const { addItem } = useCart()

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      extras: [],
      fromPrice: !!product.fromPrice,
    })
    onAdded()
    onClose()
  }

  const priceLabel = `${product.fromPrice ? 'A partir de ' : ''}${formatCurrency(product.price)}`

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <button
            type="button"
            className="modal__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <ProductImage alt={product.name} src={product.image} />
        <div className="modal__body">
          <h2 id="details-title" className="modal__title">
            {product.name}
          </h2>
          {product.description && (
            <p className="modal__description">{product.description}</p>
          )}
          <p className="modal__price">
            <span className="modal__price-label">Preço</span>
            <strong className="modal__price-value">{priceLabel}</strong>
          </p>
        </div>
        <div className="modal__footer">
          <button type="button" className="button button--primary" onClick={handleAdd}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  )
}

