export type CategoryId =
  | 'monte-seu-acai'
  | 'acai-premium'
  | 'acai-na-garrafa'
  | 'copo-da-felicidade'
  | 'fondue'
  | 'bebidas'

export interface Category {
  id: CategoryId
  name: string
  /** Short subtitle shown next to the category name when present. */
  subtitle?: string
}

/** Unit price used for topping extras on the "Monte seu Açaí" builder. */
export interface PriceOption {
  id: string
  name: string
  price: number
}

/** Sizes selectable in the "Monte seu Açaí" builder. */
export interface SizeOption {
  id: string
  name: string
  price: number
}

/**
 * A ready-made product listed on the menu.
 */
export interface Product {
  id: string
  slug: string
  name: string
  /** Short optional tagline, e.g. "Monte do seu jeito". */
  subtitle?: string
  description?: string
  /** Base/starting price. When `fromPrice` is true the UI shows "A partir de". */
  price: number
  fromPrice?: boolean
  image?: string
  category: CategoryId
  /** Controls availability. Unavailable items are prepared for a disabled state. */
  available: boolean
}

/**
 * A cart item. For a ready-made product it carries the base product;
 * for a personalized açaí the configurator builds a variant from options.
 */
export interface CartItem {
  uid: string
  productId: string
  name: string
  quantity: number
  unitPrice: number
  /** Extra options that add to the unit price (for personalized açaí). */
  extras: CartExtra[]
  fromPrice: boolean
}

export interface CartExtra {
  id: string
  label: string
  price: number
}

/** Data the customer fills in during checkout. */
export interface CheckoutData {
  name: string
  phone: string
  address: string
  number: string
  complement: string
  neighborhood: string
  notes: string
  paymentMethod: string
}
