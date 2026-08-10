import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import { getOrder } from '../api/orders'
import { useCustomerSession } from '../context/CustomerContext'
import { formatCurrency } from '../utils/format'
import { loadOrderTokens, removeOrderToken } from '../utils/orderTokens'

export function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]); const { status } = useCustomerSession()
  useEffect(() => { const local = () => Promise.all(loadOrderTokens().map(async (token) => { try { return { token, order: await getOrder(token) } } catch { removeOrderToken(token); return null } })).then((values) => setOrders(values.filter(Boolean) as any[])); if (status === 'authenticated') { void apiRequest('/api/customers/me/orders').then(async (response) => response.ok ? response.json() : []).then((values) => setOrders(values.map((order: any) => ({ token: order.publicAccessToken, order })))); return }; if (status === 'anonymous' || status === 'error') void local() }, [status])
  return <main className="page"><h1>Meus pedidos</h1>{orders.length ? orders.map(({ token, order }) => <a className="checkout-block" href={`/pedido/${token}`} key={token}><strong>Pedido #{order.number}</strong><p>{order.status} · {formatCurrency(order.totalCents / 100)}</p></a>) : <p>{status === 'loading' ? 'Carregando pedidos…' : 'Nenhum pedido encontrado.'}</p>}</main>
}
