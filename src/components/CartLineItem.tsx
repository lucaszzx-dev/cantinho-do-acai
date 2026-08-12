import type { CartItem } from '../types/domain'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { itemSubtotal } from '../utils/cart'
import { PRODUCTS } from '../data/products'
import { productImageFor } from '../data/productImages'
import { ProductImage } from './ProductImage'
import { cartConfigurationLabels } from '../utils/cartConfiguration'

export function CartLineItem({ item }: { item: CartItem }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()
  const product = PRODUCTS.find((p) => p.id === item.productId)

  const optionLabels = cartConfigurationLabels(item, product)

  return (
    <li className="cart-line">
      <div className="cart-line__thumb"><ProductImage alt={item.productName} src={productImageFor(item.productId, item.productImage)} /></div>
      <div className="cart-line__content">
        <div className="cart-line__top">
          <p className="cart-line__name">{item.productName}</p>
          <button
            type="button"
            className="cart-line__remove"
            aria-label={`Remover ${item.productName}`}
            onClick={() => removeItem(item.uid)}
          >
            ✕
          </button>
        </div>
        {optionLabels.length > 0 && (
          <p className="cart-line__extras">{optionLabels.join(' · ')}</p>
        )}
        <div className="cart-line__bottom">
          <div className="quantity-stepper" aria-label="Quantidade">
            <button
              type="button"
              className="quantity-stepper__button"
              aria-label={`Diminuir quantidade de ${item.productName}`}
              onClick={() => decreaseQuantity(item.uid)}
            >
              −
            </button>
            <span className="quantity-stepper__value" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className="quantity-stepper__button"
              aria-label={`Aumentar quantidade de ${item.productName}`}
              onClick={() => increaseQuantity(item.uid)}
            >
              +
            </button>
          </div>
          <div className="cart-line__prices">
            <span className="cart-line__unit">{formatCurrency(item.unitPrice)}</span>
            <span className="cart-line__subtotal">{formatCurrency(itemSubtotal(item))}</span>
          </div>
        </div>
      </div>
    </li>
  )
}
