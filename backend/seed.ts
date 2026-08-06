import { sql } from 'drizzle-orm'
import { db, pool } from './db/client.js'
import { categories, optionGroups, productOptions, products, productVariants, storeConfig } from './db/schema.js'
import { CATEGORIES } from '../src/data/categories.ts'
import { PRODUCTS } from '../src/data/products.ts'
import { STORE } from '../src/data/storeConfig.ts'

const cents = (price: number) => Math.round(price * 100)
async function seed() {
  for (const [index, category] of CATEGORIES.entries()) await db.insert(categories).values({ ...category, slug: category.id, sortOrder: index, active: true }).onConflictDoUpdate({ target: categories.id, set: { name: category.name, subtitle: category.subtitle, sortOrder: index, active: true } })
  for (const [index, product] of PRODUCTS.entries()) {
    await db.insert(products).values({ id: product.id, slug: product.slug, categoryId: product.category, name: product.name, subtitle: product.subtitle, description: product.description, image: product.image, active: product.available, sortOrder: index, basePriceCents: cents(product.price), fromPrice: product.fromPrice }).onConflictDoUpdate({ target: products.id, set: { slug: product.slug, categoryId: product.category, name: product.name, subtitle: product.subtitle, description: product.description, image: product.image, active: product.available, sortOrder: index, basePriceCents: cents(product.price), fromPrice: product.fromPrice } })
    for (const [variantIndex, variant] of product.variants.entries()) { const id = `${product.id}:${variant.id}`; await db.insert(productVariants).values({ id, productId: product.id, name: variant.name, priceCents: cents(variant.price), sortOrder: variantIndex, active: true }).onConflictDoUpdate({ target: productVariants.id, set: { name: variant.name, priceCents: cents(variant.price), sortOrder: variantIndex, active: true } }) }
    for (const [groupIndex, group] of product.optionGroups.entries()) {
      const groupId = `${product.id}:${group.id}`
      await db.insert(optionGroups).values({ id: groupId, productId: product.id, label: group.label, hint: group.hint, type: group.type, required: group.required, minSelectable: group.required ? 1 : 0, maxSelectable: group.maxSelectable, sortOrder: groupIndex }).onConflictDoUpdate({ target: optionGroups.id, set: { label: group.label, hint: group.hint, type: group.type, required: group.required, minSelectable: group.required ? 1 : 0, maxSelectable: group.maxSelectable, sortOrder: groupIndex } })
      for (const [optionIndex, option] of group.options.entries()) { const id = `${groupId}:${option.id}`; await db.insert(productOptions).values({ id, optionGroupId: groupId, name: option.name, priceCents: cents(option.price), active: true, sortOrder: optionIndex }).onConflictDoUpdate({ target: productOptions.id, set: { name: option.name, priceCents: cents(option.price), active: true, sortOrder: optionIndex } }) }
    }
  }
  await db.insert(storeConfig).values({ id: 'default', name: STORE.name, city: STORE.city, tagline: STORE.tagline, deliveryMode: STORE.deliveryMode, whatsappNumber: STORE.whatsappNumber, minOrderCents: cents(STORE.minOrder), schedule: STORE.schedule, address: STORE.address, paymentMethods: STORE.paymentMethods, deliveryNote: STORE.deliveryNote }).onConflictDoUpdate({ target: storeConfig.id, set: { name: STORE.name, city: STORE.city, tagline: STORE.tagline, deliveryMode: STORE.deliveryMode, whatsappNumber: STORE.whatsappNumber, minOrderCents: cents(STORE.minOrder), schedule: STORE.schedule, address: STORE.address, paymentMethods: STORE.paymentMethods, deliveryNote: STORE.deliveryNote } })
  await db.execute(sql`select 1`)
}
seed().then(() => pool.end()).catch((error) => { console.error(error); process.exitCode = 1; pool.end() })
