import type { CartItem } from '../types/domain'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { itemSubtotal } from '../utils/cart'

export function CartLineItem({ item }: { item: CartItem }) {
  const { increaseQuantity, decreaseQuantity, removeItem } = useCart()

  return (
    <li className="cart-line">
      <div className="cart-line__info">
        <p className="cart-line__name">{item.name}</p>
        {item.extras.length > 0 && (
          <p className="cart-line__extras">
            {item.extras.map((extra) => extra.label).join(', ')}
          </p>
        )}
        <p className="cart-line__unit">{formatCurrency(item.unitPrice)} cada</p>
      </div>
      <div className="cart-line__controls">
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
        <span className="cart-line__subtotal">{formatCurrency(itemSubtotal(item))}</span>
      </div>
      <button
        type="button"
        className="cart-line__remove"
        aria-label={`Remover ${item.name}`}
        onClick={() => removeItem(item.uid)}
      >
        Remover
      </button>
    </li>
  )
}

