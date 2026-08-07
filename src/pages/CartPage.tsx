import { useState } from 'react'
import { CartLineItem } from '../components/CartLineItem'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCart } from '../hooks/useCart'
import { STORE } from '../data/storeConfig'
import type { CheckoutData } from '../types/domain'
import { cartTotal } from '../utils/cart'
import { formatCurrency } from '../utils/format'
import { buildOrderMessage, buildWhatsAppLink } from '../utils/whatsapp'
import { saveCustomerSession, type CustomerSession } from '../api/customer'
import { createOrder } from '../api/orders'

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
const CUSTOMER_KEY = 'cantinho-do-acai-customer'

function loadCustomer(): CustomerSession | null {
  try { const raw = localStorage.getItem(CUSTOMER_KEY); return raw ? JSON.parse(raw) as CustomerSession : null } catch { return null }
}

export function CartPage({ onBack }: CartPageProps) {
  const { items, clearCart } = useCart()
  const [customer, setCustomer] = useState<CustomerSession | null>(loadCustomer)
  const [checkout, setCheckout] = useState<CheckoutData>(() => ({ ...EMPTY_CHECKOUT, name: loadCustomer()?.name ?? '', phone: loadCustomer()?.phone ?? '' }))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  const total = cartTotal(items)
  const missing = Math.max(0, STORE.minOrder - total)
  const canFinalize = total >= STORE.minOrder

  const handleFinalize = async () => {
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
    setError(''); setSubmitting(true)
    try {
      const session = await saveCustomerSession(checkout.name.trim(), checkout.phone)
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(session))
      setCustomer(session)
    } catch {
      // The order remains available when the convenience profile API is offline.
    }
    try {
      const order = await createOrder({ idempotencyKey, customerId: customer?.id, customerName: checkout.name, phone: checkout.phone, address: checkout.address, addressNumber: checkout.number, complement: checkout.complement, neighborhood: checkout.neighborhood, notes: checkout.notes, paymentMethod: checkout.paymentMethod, items: items.map((item) => ({ productName: item.productName, variantName: item.variantName, quantity: item.quantity, unitPrice: item.unitPrice, options: Object.values(item.selections).flat() })) })
      const message = `Pedido #${order.orderNumber}\n\n${buildOrderMessage(items, checkout)}`
      window.open(buildWhatsAppLink(message), '_blank')
      clearCart(); window.location.assign(`/pedido/${order.publicAccessToken}`)
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível registrar o pedido.') } finally { setSubmitting(false) }
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
          <span className="cart-empty__icon" aria-hidden="true">
            🛒
          </span>
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
                Faltam {formatCurrency(missing)} para o pedido mínimo.
              </p>
            ) : (
              <p className="cart-summary__ok">Pedido mínimo atingido ✔</p>
            )}
          </div>

          {canFinalize ? (
            <>
              {customer && (
                <div className="customer-session">
                  <span>Pedido como <strong>{customer.name}</strong></span>
                  <button type="button" onClick={() => { localStorage.removeItem(CUSTOMER_KEY); setCustomer(null); setCheckout(EMPTY_CHECKOUT) }}>Sair</button>
                </div>
              )}
              <CheckoutForm value={checkout} onChange={setCheckout} />

              <section className="checkout-block" aria-labelledby="block-revisao">
                <h3 className="checkout-block__title" id="block-revisao">
                  Revisão do pedido
                </h3>
                <ul className="order-review">
                  {items.map((item) => (
                    <li key={item.uid} className="order-review__row">
                      <span className="order-review__name">
                        {item.quantity}x {item.productName}
                        {item.variantName ? ` (${item.variantName})` : ''}
                      </span>
                      <span className="order-review__price">
                        {formatCurrency(item.unitPrice)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="order-review__total">
                  <span>Total</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
              </section>
            </>
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
        </>
      )}

      {items.length > 0 && (
        <div className="checkout-bar">
          <div className="checkout-bar__info">
            <span className="checkout-bar__label">Total</span>
            <strong className="checkout-bar__total">{formatCurrency(total)}</strong>
            {missing > 0 && (
              <span className="checkout-bar__missing">
                faltam {formatCurrency(missing)}
              </span>
            )}
          </div>
          <button
            type="button"
            className="button button--whatsapp checkout-bar__cta"
            onClick={handleFinalize}
            disabled={!canFinalize || submitting}
          >
            {submitting ? 'Registrando pedido…' : 'Finalizar no WhatsApp'}
          </button>
        </div>
      )}
    </div>
  )
}
