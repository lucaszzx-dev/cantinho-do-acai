import { useState } from 'react'
import { CartLineItem } from '../components/CartLineItem'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCart } from '../hooks/useCart'
import { STORE } from '../data/storeConfig'
import type { CheckoutData } from '../types/domain'
import { cartTotal } from '../utils/cart'
import { formatCurrency } from '../utils/format'
import { buildOrderMessage, buildWhatsAppLink } from '../utils/whatsapp'

interface CartPageProps {
  onBack: () => void
}

const EMPTY_CHECKOUT: CheckoutData = {
  name: '',
  phone: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  notes: '',
  paymentMethod: '',
}

export function CartPage({ onBack }: CartPageProps) {
  const { items, clearCart } = useCart()
  const [checkout, setCheckout] = useState<CheckoutData>(EMPTY_CHECKOUT)
  const [error, setError] = useState('')

  const total = cartTotal(items)
  const missing = Math.max(0, STORE.minOrder - total)
  const canFinalize = total >= STORE.minOrder

  const handleFinalize = () => {
    if (!canFinalize) return
    if (!checkout.name.trim() || !checkout.phone.trim()) {
      setError('Preencha nome e telefone para continuar.')
      return
    }
    if (!checkout.address.trim() || !checkout.number.trim() || !checkout.neighborhood.trim()) {
      setError('Preencha endereço, número e bairro para continuar.')
      return
    }
    if (!checkout.paymentMethod) {
      setError('Escolha uma forma de pagamento.')
      return
    }
    setError('')
    const message = buildOrderMessage(items, checkout)
    window.open(buildWhatsAppLink(message), '_blank')
    clearCart()
  }

  return (
    <div className="cart-page">
      <div className="cart-page__top">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← Voltar ao cardápio
        </button>
        <h2 className="cart-page__title">Seu pedido</h2>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          <span className="cart-empty__icon" aria-hidden="true">🛒</span>
          <p className="cart-empty__title">Seu carrinho está vazio</p>
          <p className="cart-empty__text">
            Adicione produtos ao carrinho para montar seu pedido.
          </p>
          <button type="button" className="button button--primary" onClick={onBack}>
            Ver cardápio
          </button>
        </div>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((item) => (
              <CartLineItem key={item.uid} item={item} />
            ))}
          </ul>

          <div className="cart-summary">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {missing > 0 ? (
              <p className="cart-summary__warning" role="alert">
                Faltam {formatCurrency(missing)} para atingir o pedido mínimo.
              </p>
            ) : (
              <p className="cart-summary__ok">Pedido mínimo atingido ✔</p>
            )}
          </div>

          {canFinalize ? (
            <CheckoutForm value={checkout} onChange={setCheckout} />
          ) : (
            <div className="cart-minimum">
              <p>
                O pedido mínimo é de {formatCurrency(STORE.minOrder)}. Você ainda
                precisa adicionar {formatCurrency(missing)}.
              </p>
            </div>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="cart-page__actions">
            <button
              type="button"
              className="button button--whatsapp button--lg"
              onClick={handleFinalize}
              disabled={!canFinalize}
            >
              Finalizar pedido no WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  )
}

