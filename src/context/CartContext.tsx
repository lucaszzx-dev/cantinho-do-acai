import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '../types/domain'
import { CartContext } from './cartContextValue'
import type { AddItemInput, CartContextValue } from './cartContextValue'
import { loadStoredCart, saveStoredCart } from '../utils/cartStorage'

/** Check if two cart items represent the same configuration. */
function sameConfig(a: CartItem, b: CartItem): boolean {
  return (
    a.productId === b.productId &&
    a.variantId === b.variantId &&
    a.unitPrice === b.unitPrice &&
    JSON.stringify(a.selections) === JSON.stringify(b.selections)
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredCart)

  useEffect(() => {
    saveStoredCart(items)
  }, [items])

  const addItem = useCallback((input: AddItemInput) => {
    setItems((current) => {
      const existing = current.find((candidate) =>
        sameConfig(candidate, { ...input, uid: '', quantity: input.quantity ?? 1 } as CartItem),
      )
      if (existing) {
        return current.map((candidate) =>
          candidate.uid === existing.uid
            ? { ...candidate, quantity: candidate.quantity + (input.quantity ?? 1) }
            : candidate,
        )
      }
      return [
        ...current,
        { ...input, quantity: input.quantity ?? 1, uid: crypto.randomUUID() },
      ]
    })
  }, [])

  const increaseQuantity = useCallback((uid: string) => {
    setItems((current) =>
      current.map((item) =>
        item.uid === uid ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }, [])

  const decreaseQuantity = useCallback((uid: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.uid === uid ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((uid: string) => {
    setItems((current) => current.filter((item) => item.uid !== uid))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, increaseQuantity, decreaseQuantity, removeItem, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
