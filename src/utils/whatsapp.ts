import { STORE } from '../data/storeConfig'
import type { CartItem, CheckoutData } from '../types/domain'
import { formatCurrency } from './format'
import { cartTotal, itemSubtotal } from './cart'

function extrasLabel(extras: CartItem['extras']): string {
  if (extras.length === 0) return '—'
  return extras.map((extra) => extra.label).join(', ')
}

/** Builds a plain-text order message that is easy for the shop to read. */
export function buildOrderMessage(
  items: CartItem[],
  checkout: CheckoutData,
): string {
  const total = cartTotal(items)
  const lines: string[] = []

  lines.push(`*Novo pedido — ${STORE.name}*`)
  lines.push('')

  lines.push('*Itens do pedido:*')
  items.forEach((item) => {
    lines.push(`- ${item.quantity}x ${item.name} (${formatCurrency(item.unitPrice)})`)
    lines.push(`  Adicionais: ${extrasLabel(item.extras)}`)
    lines.push(`  Subtotal: ${formatCurrency(itemSubtotal(item))}`)
  })
  lines.push('')
  lines.push(`*Subtotal:* ${formatCurrency(total)}`)
  lines.push(`*Total:* ${formatCurrency(total)}`)

  lines.push('')
  lines.push('*Dados de entrega:*')
  lines.push(`Nome: ${checkout.name}`)
  lines.push(`Telefone: ${checkout.phone}`)
  lines.push(
    `Endereço: ${checkout.address}, ${checkout.number}${checkout.complement ? ` — ${checkout.complement}` : ''}`,
  )
  lines.push(`Bairro: ${checkout.neighborhood || '—'}`)
  lines.push(`Observações: ${checkout.notes || '—'}`)
  lines.push(`Pagamento: ${checkout.paymentMethod}`)

  return lines.join('\n')
}

/** Returns a WhatsApp deep link with the order message pre-filled. */
export function buildWhatsAppLink(message: string): string {
  const base = `https://wa.me/${STORE.whatsappNumber}`
  return `${base}?text=${encodeURIComponent(message)}`
}
