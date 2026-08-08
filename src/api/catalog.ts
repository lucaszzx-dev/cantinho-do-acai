import type { Category, Product } from '../types/domain'
import { apiRequest } from './client'

async function request<T>(path: string): Promise<T> {
  const response = await apiRequest(path)
  if (!response.ok) throw new Error(`Catalog API returned ${response.status}`)
  return response.json() as Promise<T>
}
export const catalogApi = { categories: () => request<Category[]>('/api/categories'), products: () => request<Product[]>('/api/products'), store: () => request<{ operational?: { status: 'open' | 'closed' | 'unknown'; label: string } }>('/api/store') }
