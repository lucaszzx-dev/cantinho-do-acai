import { STORE } from '../data/storeConfig'
import { formatCurrency } from '../utils/format'
import { buildWhatsAppLink } from '../utils/whatsapp'

export function StoreHeader() {
  const waLink = buildWhatsAppLink(
    `Olá! Vim pelo cardápio digital do ${STORE.name}. Gostaria de fazer um pedido.`,
  )

  return (
    <header className="store-header">
      <div className="store-header__inner">
        <div className="store-header__logo" aria-hidden="true">
          <span>🍧</span>
        </div>
        <div className="store-header__info">
          <h1 className="store-header__name">{STORE.name}</h1>
          <p className="store-header__city">{STORE.city}</p>
          <div className="store-header__chips">
            <span className="chip chip--info" title="Horário ainda não confirmado oficialmente">
              {STORE.hours.value}
            </span>
            <span className="chip">{STORE.deliveryMode}</span>
            <span className="chip">Pedido mínimo {formatCurrency(STORE.minOrder)}</span>
          </div>
        </div>
        <a
          className="button button--whatsapp store-header__wa"
          href={waLink}
          target="_blank"
          rel="noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </header>
  )
}
