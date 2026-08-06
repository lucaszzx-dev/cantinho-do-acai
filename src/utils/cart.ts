import type { CartItem } from '../types/domain'

export function itemSubtotal(item: CartItem): number {
  return item.unitPrice * item.quantity
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + itemSubtotal(item), 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
