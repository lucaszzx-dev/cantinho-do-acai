import type { CartItem } from '../types/domain'

export const CART_STORAGE_KEY = 'cantinho-do-acai-cart'
const STORAGE_VERSION = 2

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return typeof item.uid === 'string' && typeof item.productId === 'string' && typeof item.productName === 'string' && typeof item.quantity === 'number' && typeof item.unitPrice === 'number' && typeof item.selections === 'object' && item.selections !== null && typeof item.category === 'string'
}

export function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || !('items' in parsed)) return []
    const envelope = parsed as { version: number; items: unknown }
    return envelope.version === STORAGE_VERSION && Array.isArray(envelope.items) ? envelope.items.filter(isCartItem).map(normalizeCartItem) : []
  } catch { return [] }
}

function normalizeCartItem(item: CartItem): CartItem {
  const prefix = `${item.productId}:`
  const selections = Object.fromEntries(Object.entries(item.selections).map(([groupId, ids]) => [groupId.startsWith(prefix) ? groupId.slice(prefix.length) : groupId, ids.map((id) => { const optionPrefix = `${item.productId}:${groupId.startsWith(prefix) ? groupId.slice(prefix.length) : groupId}:`; return id.startsWith(optionPrefix) ? id.slice(optionPrefix.length) : id })]))
  return { ...item, variantId: item.variantId?.startsWith(prefix) ? item.variantId.slice(prefix.length) : item.variantId, selections }
}

export function saveStoredCart(items: CartItem[]) {
  try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, items })) } catch { /* Storage may be unavailable. */ }
}
