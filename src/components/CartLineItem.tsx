import type { CartItem } from '../types/domain'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { itemSubtotal } from '../utils/cart'

export function CartLineItem({ item }: { item: CartItem }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()

  return (
    <li className="cart-line">
      <div className="cart-line__thumb" aria-hidden="true">
        <span>🍧</span>
      </div>
      <div className="cart-line__content">
        <div className="cart-line__top">
          <p className="cart-line__name">{item.name}</p>
          <button
            type="button"
            className="cart-line__remove"
            aria-label={`Remover ${item.name}`}
            onClick={() => removeItem(item.uid)}
          >
            ✕
          </button>
        </div>
        {item.extras.length > 0 && (
          <p className="cart-line__extras">
            {item.extras.map((extra) => extra.label).join(', ')}
          </p>
        )}
        <div className="cart-line__bottom">
          <div className="quantity-stepper" aria-label="Quantidade">
            <button
              type="button"
              className="quantity-stepper__button"
              aria-label={`Diminuir quantidade de ${item.name}`}
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
              aria-label={`Aumentar quantidade de ${item.name}`}
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
