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
  subtitle?: string
}

export interface ProductVariant {
  id: string
  name: string
  price: number
}

export interface ProductOption {
  id: string
  name: string
  price: number
}

export interface OptionGroup {
  id: string
  label: string
  hint?: string
  type: 'single' | 'multi'
  required: boolean
  options: ProductOption[]
  maxSelectable?: number
}

export interface Product {
  id: string
  slug: string
  name: string
  subtitle?: string
  description?: string
  image?: string
  category: CategoryId
  available: boolean
  price: number
  fromPrice: boolean
  variants: ProductVariant[]
  optionGroups: OptionGroup[]
}

export interface CartItem {
  uid: string
  productId: string
  productName: string
  productImage?: string
  category: CategoryId
  variantId?: string
  variantName?: string
  selections: Record<string, string[]>
  quantity: number
  unitPrice: number
}

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