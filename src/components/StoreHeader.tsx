import { useEffect, useState } from 'react'
import { catalogApi } from '../api/catalog'
import { useCustomerSession } from '../context/CustomerContext'
import { STORE } from '../data/storeConfig'
import { formatCurrency } from '../utils/format'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { StoreLogo } from './StoreLogo'

export function StoreHeader() {
  const { status, customer, logout } = useCustomerSession()
  const [operational, setOperational] = useState({ status: 'unknown', label: STORE.schedule.value })
  useEffect(() => { const refresh = () => catalogApi.store().then((store) => setOperational((current) => store.operational ?? current)).catch(() => undefined); void refresh(); const id = window.setInterval(refresh, 60000); return () => window.clearInterval(id) }, [])
  const statusClass = operational.status === 'open' ? 'chip--open' : operational.status === 'closed' ? 'chip--closed' : 'chip--pending'
  return <header className="store-header"><div className="store-header__inner"><StoreLogo className="store-header__logo" /><div className="store-header__info"><h1 className="store-header__name">{STORE.name}</h1><p className="store-header__city">{STORE.city} · {STORE.deliveryMode}</p><div className="store-header__chips"><span className={`chip ${statusClass}`}><span className="chip__dot" />{operational.label}</span><span className="chip">Pedido mínimo {formatCurrency(STORE.minOrder)}</span></div></div><a className="button button--whatsapp store-header__wa" href={buildWhatsAppLink(`Olá! Vim pelo cardápio digital do ${STORE.name}. Gostaria de fazer um pedido.`)} target="_blank" rel="noreferrer">WhatsApp</a><a className="button button--ghost" href="/meus-pedidos">Pedidos</a>{status === 'loading' ? <span className="button button--account">Carregando…</span> : customer ? <button className="button button--account" onClick={() => void logout()}>Sair, {customer.name.split(' ')[0]}</button> : <a className="button button--account" href="/conta">Entrar</a>}</div></header>
}
