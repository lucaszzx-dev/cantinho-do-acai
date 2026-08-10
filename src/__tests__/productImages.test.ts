import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../data/products'
import { productImageFor } from '../data/productImages'

describe('product image mapping', () => {
  it('maps the Tradicional explicitly to its own asset', () => {
    expect(productImageFor('acai-tradicional')).toBe('/images/products/acai-tradicional.png')
  })

  it('maps each catalog product by its id, never by array position', () => {
    for (const product of PRODUCTS) expect(product.image).toBe(productImageFor(product.id))
  })

  it('keeps Premium products on their respective images', () => {
    expect(productImageFor('acai-beijinho')).toBe('/images/products/acai-beijinho.png')
    expect(productImageFor('acai-ferrero')).toBe('/images/products/acai-ferrero-rocher.png')
    expect(productImageFor('acai-kit-kat')).toBe('/images/products/acai-kitkat.png')
  })

  it('uses the same stable image after a persisted cart reload', () => {
    const persisted = { productId: 'copo-doce-de-leite', productImage: '/obsolete/path.png' }
    expect(productImageFor(persisted.productId, persisted.productImage)).toBe('/images/products/copo-doce-de-leite.png')
  })

  it('does not retain legacy public paths', () => {
    expect(PRODUCTS.every((product) => !product.image?.startsWith('/products/') && !product.image?.includes('acaiproject'))).toBe(true)
  })
})
