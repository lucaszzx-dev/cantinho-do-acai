import { useState } from 'react'
import { useCart } from '../hooks/useCart'
import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { Modal } from './Modal'
import { ProductImage } from './ProductImage'

interface ProductDetailsModalProps {
  product: Product
  onClose: () => void
  onAdded: () => void
}

export function ProductDetailsModal({ product, onClose, onAdded }: ProductDetailsModalProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAdd = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      selections: {},
      unitPrice: product.price,
      quantity,
    })
    onAdded()
    onClose()
  }

  const priceLabel = `${product.fromPrice ? 'A partir de ' : ''}${formatCurrency(product.price)}`

  return (
    <Modal title={product.name} onClose={onClose}>
      <ProductImage alt={product.name} src={product.image} variant="hero" eager />
      <div className="modal__body">
        <div className="modal__header">
          <button type="button" className="modal__close" aria-label="Fechar" onClick={onClose}>
            ✕
          </button>
        </div>
        <h2 className="modal__title">{product.name}</h2>
        {product.subtitle && <p className="modal__subtitle">{product.subtitle}</p>}
        {product.description && <p className="modal__description">{product.description}</p>}

        <div className="modal__price">
          <span className="modal__price-label">Preço</span>
          <strong className="modal__price-value">{priceLabel}</strong>
        </div>

        <div className="modal__quantity">
          <span className="modal__quantity-label">Quantidade</span>
          <div className="quantity-stepper" aria-label="Quantidade">
            <button
              type="button"
              className="quantity-stepper__button"
              aria-label="Diminuir quantidade"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            >
              −
            </button>
            <span className="quantity-stepper__value" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="quantity-stepper__button"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity((current) => current + 1)}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="modal__footer">
        <button
          type="button"
          className="button button--primary button--lg"
          onClick={handleAdd}
        >
          Adicionar {quantity > 1 ? `${quantity}x ` : ''}ao carrinho
        </button>
      </div>
    </Modal>
  )
}
