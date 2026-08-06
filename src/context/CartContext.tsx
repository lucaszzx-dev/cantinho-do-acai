import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CartItem } from '../types/domain'
import { CartContext } from './cartContextValue'
import type { AddItemInput, CartContextValue } from './cartContextValue'

const STORAGE_KEY = 'cantinho-do-acai-cart'
const STORAGE_VERSION = 2

interface StorageEnvelope {
  version: number
  items: CartItem[]
}

function isCartItemV2(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.uid === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.unitPrice === 'number' &&
    typeof item.selections === 'object' &&
    item.selections !== null &&
    typeof item.category === 'string'
  )
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)

    // New format: { version: 2, items: CartItem[] }
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      'items' in parsed
    ) {
      const envelope = parsed as StorageEnvelope
      if (envelope.version === STORAGE_VERSION && Array.isArray(envelope.items)) {
        return envelope.items.filter(isCartItemV2)
      }
      // Version mismatch — discard safely
      return []
    }

    // Legacy v1 format (extras array) — discard safely, never crash
    return []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  try {
    const envelope: StorageEnvelope = { version: STORAGE_VERSION, items }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Ignore storage write failures (e.g. private mode).
  }
}

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
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    saveCart(items)
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