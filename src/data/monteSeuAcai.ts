import type { PriceOption, SizeOption } from '../types/domain'

/**
 * MOCK options for the "Monte seu Açaí" configurator.
 *
 * The shop has NOT confirmed the official sizes, toppings, fruits or prices
 * yet. These values are provisional and centralized here so they can be
 * swapped for the official table later without touching the UI.
 */
export const ACADAI_SIZES: SizeOption[] = [
  { id: '300ml', name: '300ml', price: 17.9 },
  { id: '400ml', name: '400ml', price: 19.9 },
  { id: '500ml', name: '500ml', price: 21.9 },
]

/** Maximum number of complements a customer may add (MOCK limit). */
export const MAX_COMPLEMENTS = 4
/** Maximum number of fruits a customer may add (MOCK limit). */
export const MAX_FRUITS = 3

/** Toppings such as granola and condensed milk. */
export const COMPLEMENTS: PriceOption[] = [
  { id: 'granola', name: 'Granola', price: 2 },
  { id: 'leite-condensado', name: 'Leite condensado', price: 2 },
  { id: 'ninho', name: 'Creme de ninho', price: 3 },
  { id: 'nutella', name: 'Creme de avelã', price: 3 },
  { id: 'paçoca', name: 'Paçoca', price: 2 },
  { id: 'chocolate-em-pedacos', name: 'Chocolate em pedaços', price: 3 },
  { id: 'leite-em-po', name: 'Leite em pó', price: 2 },
]

export const FRUITS: PriceOption[] = [
  { id: 'morango', name: 'Morango', price: 2 },
  { id: 'banana', name: 'Banana', price: 1 },
  { id: 'uva', name: 'Uva', price: 2 },
  { id: 'kiwi', name: 'Kiwi', price: 2 },
]

export const COBERTURAS: PriceOption[] = [
  { id: 'sem-cobertura', name: 'Sem cobertura', price: 0 },
  { id: 'morango', name: 'Cobertura de morango', price: 1 },
  { id: 'chocolate', name: 'Cobertura de chocolate', price: 1 },
  { id: 'leite-condensado', name: 'Cobertura de leite condensado', price: 1 },
]
