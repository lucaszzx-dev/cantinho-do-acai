import { asc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { categories, optionGroups, productOptions, products, productVariants, storeConfig } from '../db/schema.js'
import { storeStatus, type Schedule } from '../store-status.js'
import { productImageFor } from '../../src/data/productImages.ts'

export type CatalogRepository = {
  getStore(): Promise<unknown>
  getCategories(): Promise<unknown[]>
  getProducts(): Promise<unknown[]>
  getProductBySlug(slug: string): Promise<unknown | undefined>
}

const cents = (value: number) => value / 100
const mapProduct = (product: typeof products.$inferSelect, category: typeof categories.$inferSelect, variants: (typeof productVariants.$inferSelect)[], groups: (typeof optionGroups.$inferSelect)[], options: (typeof productOptions.$inferSelect)[]) => ({
  id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle ?? undefined, description: product.description ?? undefined, image: productImageFor(product.id, product.image ?? undefined), category: category.id, available: product.active, price: cents(product.basePriceCents), fromPrice: product.fromPrice,
  variants: variants.filter((item) => item.active).map((item) => ({ id: item.id.slice(product.id.length + 1), name: item.name, price: cents(item.priceCents) })),
  optionGroups: groups.map((group) => ({ id: group.id, label: group.label, hint: group.hint ?? undefined, type: group.type, required: group.required, minSelectable: group.minSelectable || undefined, maxSelectable: group.maxSelectable ?? undefined, options: options.filter((item) => item.optionGroupId === group.id && item.active).map((item) => ({ id: item.id, name: item.name, price: cents(item.priceCents) })) })),
})

export const postgresCatalogRepository: CatalogRepository = {
  async getStore() {
    const [store] = await db.select().from(storeConfig).limit(1)
    if (!store) return undefined
    return { ...store, minOrder: cents(store.minOrderCents), minOrderCents: undefined, operational: storeStatus(store.schedule as Schedule) }
  },
  async getCategories() {
    return db.select({ id: categories.id, slug: categories.slug, name: categories.name, subtitle: categories.subtitle }).from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder))
  },
  async getProducts() {
    const allProducts = await db.select().from(products).where(eq(products.active, true)).orderBy(asc(products.sortOrder))
    return Promise.all(allProducts.map((product) => this.getProductBySlug(product.slug)))
  },
  async getProductBySlug(slug) {
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1)
    if (!product || !product.active) return undefined
    const [category] = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1)
    if (!category) return undefined
    const [variants, groups] = await Promise.all([
      db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.sortOrder)),
      db.select().from(optionGroups).where(eq(optionGroups.productId, product.id)).orderBy(asc(optionGroups.sortOrder)),
    ])
    const options = groups.length ? await db.select().from(productOptions).orderBy(asc(productOptions.sortOrder)) : []
    return mapProduct(product, category, variants, groups, options)
  },
}
