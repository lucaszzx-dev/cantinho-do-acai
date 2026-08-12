import type { CartItem, Product } from '../types/domain'

export function cartConfigurationLabels(item: CartItem, product?: Product) {
  const labels = item.variantName ? [item.variantName] : []
  for (const [groupId, ids] of Object.entries(item.selections)) {
    const group = product?.optionGroups.find((candidate) => candidate.id === groupId)
    for (const id of ids) {
      const option = group?.options.find((candidate) => candidate.id === id)
      if (option) labels.push(option.name)
    }
  }
  return labels
}

export function orderItemPayload(items: CartItem[]) {
  return items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity, selections: item.selections }))
}
