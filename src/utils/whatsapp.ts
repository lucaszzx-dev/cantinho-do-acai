import { STORE } from '../data/storeConfig'
import type { CartItem, CheckoutData } from '../types/domain'
import { formatCurrency } from './format'
import { cartTotal } from './cart'

function itemName(item: CartItem): string {
  return item.name.replace(/ · /g, ' ')
}

/**
 * Builds a clean, emoji-friendly order message that is easy for the shop to read.
 */
export function buildOrderMessage(
  items: CartItem[],
  checkout: CheckoutData,
): string {
  const total = cartTotal(items)
  const lines: string[] = []

  lines.push(`💜 Novo pedido - ${STORE.name}`)
  lines.push('')

  items.forEach((item) => {
    lines.push(`${item.quantity}x ${itemName(item)}`)
    item.extras.forEach((extra) => lines.push(` ${extra.label}`))
    lines.push(formatCurrency(item.unitPrice))
    lines.push('')
  })

  lines.push(`Total: ${formatCurrency(total)}`)
  lines.push('')

  lines.push(`👤 Nome: ${checkout.name}`)
  lines.push(`📱 Telefone: ${checkout.phone}`)
  const addressParts = [
    checkout.address,
    checkout.number && `nº ${checkout.number}`,
    checkout.complement,
    checkout.neighborhood,
  ].filter(Boolean)
  lines.push(`📍 Endereço: ${addressParts.join(' - ')}`)
  lines.push(`💳 Pagamento: ${checkout.paymentMethod}`)
  lines.push(`📝 Observações: ${checkout.notes || '—'}`)

  return lines.join('\n')
}

/** Returns a WhatsApp deep link with the order message pre-filled. */
export function buildWhatsAppLink(message: string): string {
  const base = `https://wa.me/${STORE.whatsappNumber}`
  return `${base}?text=${encodeURIComponent(message)}`
}
