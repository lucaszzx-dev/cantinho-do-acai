import { STORE } from '../data/storeConfig'
import { useStoreStatus } from '../hooks/useStoreStatus'
import { formatCurrency } from '../utils/format'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { StoreLogo } from './StoreLogo'

export function StoreHeader() {
  const { status, label } = useStoreStatus()
  const waLink = buildWhatsAppLink(
    `Olá! Vim pelo cardápio digital do ${STORE.name}. Gostaria de fazer um pedido.`,
  )

  const statusClass =
    status === 'open' ? 'chip--open' : status === 'closed' ? 'chip--closed' : 'chip--pending'

  return (
    <header className="store-header">
      <div className="store-header__inner">
        <StoreLogo className="store-header__logo" />
        <div className="store-header__info">
          <h1 className="store-header__name">{STORE.name}</h1>
          <p className="store-header__city">
            {STORE.city} · {STORE.deliveryMode}
          </p>
          <div className="store-header__chips">
            <span className={`chip ${statusClass}`}>
              <span className="chip__dot" aria-hidden="true" />
              {label}
            </span>
            <span className="chip">Pedido mínimo {formatCurrency(STORE.minOrder)}</span>
          </div>
        </div>
        <a
          className="button button--whatsapp store-header__wa"
          href={waLink}
          target="_blank"
          rel="noreferrer"
          aria-label={`Falar com a loja no WhatsApp (${STORE.whatsappDisplay})`}
        >
          WhatsApp
        </a>
      </div>
    </header>
  )
}
