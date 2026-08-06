import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem } from '../types/domain'

const STORAGE_KEY = 'cantinho-do-acai-cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.uid === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.name === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.unitPrice === 'number' &&
    Array.isArray(item.extras)
  )
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

export interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'uid' | 'quantity'>) => void
  increaseQuantity: (uid: string) => void
  decreaseQuantity: (uid: string) => void
  removeItem: (uid: string) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Ignore storage write failures (e.g. private mode).
    }
  }, [items])

  const addItem = useCallback(
    (item: Omit<CartItem, 'uid' | 'quantity'>) => {
      setItems((current) => {
        const existing = current.find(
          (candidate) =>
            candidate.productId === item.productId &&
            candidate.unitPrice === item.unitPrice &&
            JSON.stringify(candidate.extras) === JSON.stringify(item.extras),
        )
        if (existing) {
          return current.map((candidate) =>
            candidate.uid === existing.uid
              ? { ...candidate, quantity: candidate.quantity + 1 }
              : candidate,
          )
        }
        return [
          ...current,
          { ...item, quantity: 1, uid: crypto.randomUUID() },
        ]
      })
    },
    [],
  )

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

  const value = useMemo(
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
