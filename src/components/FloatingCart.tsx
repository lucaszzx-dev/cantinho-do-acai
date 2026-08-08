import { useEffect, useState } from 'react'
import { useCart } from '../hooks/useCart'
import { cartItemCount, cartTotal } from '../utils/cart'
import { formatCurrency } from '../utils/format'

interface FloatingCartProps { onOpen: () => void }

export function FloatingCart({ onOpen }: FloatingCartProps) {
  const { items } = useCart()
  const count = cartItemCount(items)
  const total = cartTotal(items)
  const [pastHero, setPastHero] = useState(false)
  useEffect(() => { const update = () => setPastHero((document.querySelector('.hero-art')?.getBoundingClientRect().bottom ?? 0) < 80); addEventListener('scroll', update, { passive: true }); update(); return () => removeEventListener('scroll', update) }, [])
  return <button type="button" className={`floating-cart ${pastHero ? 'is-visible' : ''}`} onClick={onOpen}><span className="floating-cart__count" aria-hidden="true">{count}</span><span className="floating-cart__label">Carrinho</span><span className="floating-cart__total">{count === 0 ? '0 itens' : `${count} itens • ${formatCurrency(total)}`}</span></button>
}
