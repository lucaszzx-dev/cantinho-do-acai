import { createContext } from 'react'
import type { CartItem } from '../types/domain'

export type AddItemInput = Omit<CartItem, 'uid' | 'quantity'> & { quantity?: number }

export interface CartContextValue {
  items: CartItem[]
  addItem: (item: AddItemInput) => void
  increaseQuantity: (uid: string) => void
  decreaseQuantity: (uid: string) => void
  removeItem: (uid: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)