import type { Product } from '../types/domain'

import imgAcai from '../assets/products/acai.avif'
import imgAcai1 from '../assets/products/acai1.avif'
import imgAcai2 from '../assets/products/acai2.avif'
import imgAcai3 from '../assets/products/acai3.avif'
import imgAcai4 from '../assets/products/acai4.avif'
import imgAcai5 from '../assets/products/acai5.avif'
import imgAcai6 from '../assets/products/acai6.avif'
import imgAcai8 from '../assets/products/acai8.avif'
import imgAcai9 from '../assets/products/acai9.avif'
import imgAcai10 from '../assets/products/acai10.avif'
import imgAcai11 from '../assets/products/acai11.avif'

/**
 * Menu products with real photos when available.
 *
 * Image assignment (sequential from source files):
 * - acai.avif  → Açaí Tradicional (Monte Seu Açaí)
 * - acai1.avif → Açaí Morango com Creme de Avelã
 * - acai2.avif → Açaí Beijinho
 * - acai3.avif → Açaí Confete
 * - acai4.avif → Açaí Bis
 * - acai5.avif → Açaí Granola
 * - acai6.avif → Açaí Ferrero
 * - acai8.avif → Açaí Trento
 * - acai9.avif → Açaí Kit Kat
 * - acai10.avif → Açaí Uva e Morango
 * - acai11.avif → Açaí na Garrafa 300ml
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
    image: imgAcai,
    category: 'monte-seu-acai',
    available: true,
  },

  // AÇAÍ PREMIUM
  {
    id: 'acai-morango-creme-avela',
    slug: 'acai-morango-creme-de-avela',
    name: 'Açaí Morango com Creme de Avelã',
    price: 20.9,
    fromPrice: true,
    image: imgAcai1,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-beijinho',
    slug: 'acai-beijinho',
    name: 'Açaí Beijinho',
    price: 23.9,
    fromPrice: true,
    image: imgAcai2,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-confete',
    slug: 'acai-confete',
    name: 'Açaí Confete',
    price: 25.9,
    fromPrice: true,
    image: imgAcai3,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-bis',
    slug: 'acai-bis',
    name: 'Açaí Bis',
    price: 25.9,
    fromPrice: true,
    image: imgAcai4,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-granola',
    slug: 'acai-granola',
    name: 'Açaí Granola',
    price: 20.9,
    fromPrice: true,
    image: imgAcai5,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-ferrero',
    slug: 'acai-ferrero',
    name: 'Açaí Ferrero',
    price: 25.9,
    fromPrice: true,
    image: imgAcai6,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-trento',
    slug: 'acai-trento',
    name: 'Açaí Trento',
    price: 25.9,
    fromPrice: true,
    image: imgAcai8,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-kit-kat',
    slug: 'acai-kit-kat',
    name: 'Açaí Kit Kat',
    price: 25.9,
    fromPrice: true,
    image: imgAcai9,
    category: 'acai-premium',
    available: true,
  },
  {
    id: 'acai-uva-morango',
    slug: 'acai-uva-e-morango',
    name: 'Açaí Uva e Morango',
    price: 21.9,
    fromPrice: true,
    image: imgAcai10,
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
    image: imgAcai11,
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
