import { STORE } from '../data/storeConfig'
import { PRODUCTS } from '../data/products'
import type { CartItem, CheckoutData } from '../types/domain'
import { formatCurrency } from './format'
import { cartTotal } from './cart'

/**
 * Builds a clean, emoji-friendly order message that is easy for the shop to
 * read. No internal IDs are exposed.
 */
export function buildOrderMessage(
  items: CartItem[],
  checkout: CheckoutData,
): string {
  const total = cartTotal(items)
  const lines: string[] = []

  lines.push(`🍧 Novo pedido - ${STORE.name}`)
  lines.push('')

  for (const item of items) {
    const emoji =
      item.category === 'acai-na-garrafa'
        ? '🥤'
        : item.category === 'copo-da-felicidade'
          ? '🍭'
          : item.category === 'fondue'
            ? '🥟'
            : item.category === 'bebidas'
              ? '🧃'
              : '🍧'

    lines.push(`${emoji} ${item.productName}`)
    if (item.variantName) lines.push(`Tamanho: ${item.variantName}`)

    for (const [groupId, ids] of Object.entries(item.selections)) {
      if (ids.length === 0) continue
      const product = PRODUCTS.find((p) => p.id === item.productId)
      const group = product?.optionGroups.find((g) => g.id === groupId)
      if (!group) continue

      const paid: string[] = []
      const free: string[] = []
      for (const id of ids) {
        const opt = group.options.find((o) => o.id === id)
        if (!opt) continue
        if (opt.price > 0) {
          paid.push(`${opt.name} (+ ${formatCurrency(opt.price)})`)
        } else {
          free.push(opt.name)
        }
      }

      if (free.length > 0) {
        lines.push(`${group.label}:`)
        for (const name of free) lines.push(` ${name}`)
      }
      if (paid.length > 0) {
        lines.push('Adicionais:')
        for (const p of paid) lines.push(` ${p}`)
      }
    }

    lines.push(`Qtd: ${item.quantity}`)
    lines.push(`Unitário: ${formatCurrency(item.unitPrice)}`)
    lines.push(`Subtotal: ${formatCurrency(item.unitPrice * item.quantity)}`)
    lines.push('')
  }

  lines.push(`Total: ${formatCurrency(total)}`)
  lines.push('')

  lines.push(`Nome: ${checkout.name}`)
  lines.push(`Telefone: ${checkout.phone}`)
  const addressParts = [
    checkout.address,
    checkout.number && `nº ${checkout.number}`,
    checkout.complement,
    checkout.neighborhood,
  ].filter(Boolean)
  lines.push(`Endereço: ${addressParts.join(' - ')}`)
  lines.push(`Pagamento: ${checkout.paymentMethod}`)
  if (checkout.paymentMethod === 'Dinheiro') lines.push(checkout.needsChange && checkout.changeForCents ? `Troco para: ${formatCurrency(checkout.changeForCents / 100)}` : 'Troco: Não precisa')
  if (checkout.notes) lines.push(`Observações: ${checkout.notes}`)

  return lines.join('\n')
}

/** Returns a WhatsApp deep link with the order message pre-filled. */
export function buildWhatsAppLink(message: string): string {
  const base = `https://wa.me/${STORE.whatsappNumber}`
  return `${base}?text=${encodeURIComponent(message)}`
}
