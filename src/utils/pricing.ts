import type { CartItem, OptionGroup, Product, ProductVariant } from '../types/domain'

export function variantPrice(variant: ProductVariant): number {
  return variant.price
}

export function optionsTotal(
  optionGroups: OptionGroup[],
  selections: Record<string, string[]>,
): number {
  let total = 0
  for (const group of optionGroups) {
    const selectedIds = selections[group.id] ?? []
    for (const option of group.options) {
      if (selectedIds.includes(option.id)) {
        total += option.price
      }
    }
  }
  return total
}

export function unitPrice(
  variantPrice: number,
  optionGroups: OptionGroup[],
  selections: Record<string, string[]>,
): number {
  return variantPrice + optionsTotal(optionGroups, selections)
}

export function itemSubtotal(item: CartItem): number {
  return item.unitPrice * item.quantity
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + itemSubtotal(item), 0)
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function minimumVariantPrice(product: Product): number {
  if (product.variants.length === 0) return product.price
  return Math.min(...product.variants.map((v) => v.price))
}

export function buildFromPrice(product: Product): number {
  return minimumVariantPrice(product)
}