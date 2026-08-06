import { useCart } from '../hooks/useCart'
import { cartItemCount, cartTotal } from '../utils/cart'
import { formatCurrency } from '../utils/format'

interface FloatingCartProps {
  onOpen: () => void
}

export function FloatingCart({ onOpen }: FloatingCartProps) {
  const { items } = useCart()
  const count = cartItemCount(items)
  const total = cartTotal(items)

  if (count === 0) return null

  return (
    <button type="button" className="floating-cart" onClick={onOpen}>
      <span className="floating-cart__count" aria-hidden="true">
        {count}
      </span>
      <span className="floating-cart__label">Ver carrinho</span>
      <span className="floating-cart__total">{formatCurrency(total)}</span>
    </button>
  )
}

