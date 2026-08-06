import { useMemo } from 'react'
import type { Product } from '../types/domain'

/**
 * Filters products by name, description or category name. Empty query
 * returns everything. Unknown categories are searched by their id.
 */
export function useSearch(query: string, products: Product[]): Product[] {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return products
    return products.filter((product) => {
      const categoryLabel = product.category.replace(/-/g, ' ')
      const haystack = [
        product.name,
        product.description ?? '',
        product.subtitle ?? '',
        categoryLabel,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [query, products])
}
