import type { Product } from '../types/domain'

/**
 * Menu products. No remote images are used as "official" photos; the UI shows
 * an elegant placeholder when `image` is absent. Add a local image path here
 * later to replace placeholders per product.
 */
export const PRODUCTS: Product[] = [
  // MONTE SEU AÇAÍ
  {
    id: 'acai-tradicional',
    slug: 'acai-tradicional',
    name: 'Açaí Tradicional',
    subtitle: 'Monte do seu jeito',
    description:
      'Açaí cremoso e bem gelado, preparado na hora do jeitinho que você gosta.',
    price: 17.9,
    fromPrice: true,
    category: 'monte-seu-acai',
    available: true,
  },

  // AÇAÍ PREMIUM
  {
    id: 'acai-morango-creme-avelã',
    slug: 'acai-morango-creme-de-avela',
    name: 'Açaí Morango com Creme de Avelã',
    price: 20.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-beijinho',
    slug: 'acai-beijinho',
    name: 'Açaí Beijinho',
    price: 23.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-confete',
    slug: 'acai-confete',
    name: 'Açaí Confete',
    price: 25.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-bis',
    slug: 'acai-bis',
    name: 'Açaí Bis',
    price: 25.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-granola',
    slug: 'acai-granola',
    name: 'Açaí Granola',
    price: 20.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-ferrero',
    slug: 'acai-ferrero',
    name: 'Açaí Ferrero',
    price: 25.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-trento',
    slug: 'acai-trento',
    name: 'Açaí Trento',
    price: 25.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-kit-kat',
    slug: 'acai-kit-kat',
    name: 'Açaí Kit Kat',
    price: 25.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-uva-morango',
    slug: 'acai-uva-e-morango',
    name: 'Açaí Uva e Morango',
    price: 21.9,
    fromPrice: true,
    category: 'acai-premium',
    available: true,
  },

  // AÇAÍ NA GARRAFA
  {
    id: 'acai-garrafa-300',
    slug: 'acai-na-garrafa-300ml',
    name: 'Açaí na Garrafa | 300ml',
    description:
      'Bebida cremosa, refrescante e perfeita para qualquer momento do dia.',
    price: 16,
    fromPrice: true,
    category: 'acai-na-garrafa',
    available: true,
  },

  // COPO DA FELICIDADE
  {
    id: 'copo-doce-de-leite',
    slug: 'copo-da-felicidade-doce-de-leite',
    name: 'Copo da Felicidade Doce de Leite',
    price: 17,
    category: 'copo-da-felicidade',
    available: true,
  },
  {
    id: 'copo-chocolate-amendoim',
    slug: 'copo-da-felicidade-chocolate-amendoim',
    name: 'Copo da Felicidade Creme de Chocolate com Amendoim',
    price: 17,
    category: 'copo-da-felicidade',
    available: true,
  },
  {
    id: 'copo-premium-morango-uva',
    slug: 'copo-da-felicidade-premium-morangos-e-uva',
    name: 'Copo da Felicidade Premium Morangos e Uva',
    price: 18,
    category: 'copo-da-felicidade',
    available: true,
  },

  // FONDUE
  {
    id: 'fondue-na-roleta',
    slug: 'fondue-na-roleta',
    name: 'Fondue na Roleta',
    description:
      'Uma combinação de brownie, creme de avelã, creme de ninho, uva verde e morangos.',
    price: 25.9,
    category: 'fondue',
    available: true,
  },

  // BEBIDAS
  {
    id: 'agua-sem-gas',
    slug: 'agua-sem-gas',
    name: 'Água sem Gás',
    price: 4.99,
    category: 'bebidas',
    available: true,
  },
  {
    id: 'agua-com-gas',
    slug: 'agua-com-gas',
    name: 'Água com Gás',
    price: 5.99,
    category: 'bebidas',
    available: true,
  },
]
