import { useEffect, useState } from 'react'
import { catalogApi } from '../api/catalog'
import { saveCustomerSession, type CustomerSession } from '../api/customer'
import { STORE } from '../data/storeConfig'
import { formatCurrency } from '../utils/format'
import { buildWhatsAppLink } from '../utils/whatsapp'
import { StoreLogo } from './StoreLogo'

const customerKey = 'cantinho-do-acai-customer'
function savedCustomer() { try { const value = localStorage.getItem(customerKey); return value ? JSON.parse(value) as CustomerSession : null } catch { return null } }

export function StoreHeader() {
  const [customer, setCustomer] = useState<CustomerSession | null>(savedCustomer)
  const [accountOpen, setAccountOpen] = useState(false)
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [operational, setOperational] = useState({ status: 'unknown', label: STORE.schedule.value })
  useEffect(() => { const refresh = () => catalogApi.store().then((store) => setOperational((current) => store.operational ?? current)).catch(() => undefined); refresh(); const id = window.setInterval(refresh, 60000); return () => window.clearInterval(id) }, [])
  const save = async () => {
    if (name.trim().length < 2) return setError('Informe seu nome.')
    if (phone.replace(/\D/g, '').length < 8) return setError('Informe um telefone válido.')
    setSaving(true); setError('')
    try { const next = await saveCustomerSession(name.trim(), phone); localStorage.setItem(customerKey, JSON.stringify(next)); setCustomer(next); setAccountOpen(false) }
    catch { setError('Não foi possível salvar seus dados. Confira a conexão e tente novamente.') }
    finally { setSaving(false) }
  }
  const statusClass = operational.status === 'open' ? 'chip--open' : operational.status === 'closed' ? 'chip--closed' : 'chip--pending'
  return <header className="store-header"><div className="store-header__inner"><StoreLogo className="store-header__logo" /><div className="store-header__info"><h1 className="store-header__name">{STORE.name}</h1><p className="store-header__city">{STORE.city} · {STORE.deliveryMode}</p><div className="store-header__chips"><span className={`chip ${statusClass}`}><span className="chip__dot" />{operational.label}</span><span className="chip">Pedido mínimo {formatCurrency(STORE.minOrder)}</span></div></div><a className="button button--whatsapp store-header__wa" href={buildWhatsAppLink(`Olá! Vim pelo cardápio digital do ${STORE.name}. Gostaria de fazer um pedido.`)} target="_blank" rel="noreferrer">WhatsApp</a><a className="button button--ghost" href="/meus-pedidos">Pedidos</a><a className="button button--account" href="/conta">{customer ? `Olá, ${customer.name.split(' ')[0]}` : 'Entrar'}</a></div>{accountOpen && <div className="account-modal" role="dialog" aria-modal="true"><div className="account-modal__content"><h2>{customer ? 'Minha conta' : 'Entrar'}</h2><label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label><label>Telefone<input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" disabled={saving} onClick={save}>{saving ? 'Salvando…' : 'Continuar'}</button>{customer && <button className="button button--ghost" onClick={() => { localStorage.removeItem(customerKey); setCustomer(null); setName(''); setPhone(''); setAccountOpen(false) }}>Sair</button>}<button className="button button--ghost" onClick={() => setAccountOpen(false)}>Fechar</button></div></div>}</header>
}
