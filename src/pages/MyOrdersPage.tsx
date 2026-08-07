import { useEffect, useState } from 'react'
import { getOrder } from '../api/orders'
import { loadOrderTokens, removeOrderToken } from '../utils/orderTokens'
import { formatCurrency } from '../utils/format'
export function MyOrdersPage() { const [orders, setOrders] = useState<any[]>([]); useEffect(() => { Promise.all(loadOrderTokens().map(async (token) => { try { return { token, order: await getOrder(token) } } catch { removeOrderToken(token); return null } })).then((values) => setOrders(values.filter(Boolean) as any[])) }, []); return <main className="page"><h1>Meus pedidos</h1>{orders.length ? orders.map(({ token, order }) => <a className="checkout-block" href={`/pedido/${token}`} key={token}><strong>Pedido #{order.number}</strong><p>{order.status} · {formatCurrency(order.totalCents / 100)}</p></a>) : <p>Nenhum pedido salvo neste dispositivo.</p>}</main> }
