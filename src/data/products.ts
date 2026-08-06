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
import imgAgua from '../assets/products/agua.avif'
import imgAguaGas from '../assets/products/aguagas.avif'
import imgFondue from '../assets/products/fondue.jpeg'

const DESCARVEIS = {
  id: 'descartaveis',
  label: 'Descartáveis',
  type: 'single' as const,
  required: true,
  options: [
    { id: 'sim', name: 'Sim, por favor!', price: 0 },
    { id: 'nao', name: 'Não, obrigado.', price: 0 },
  ],
}

const ACADAI_TRADICIONAL_SIZES = [
  { id: '300ml', name: '300ml', price: 17.9 },
  { id: '400ml', name: '400ml', price: 21.9 },
  { id: '500ml', name: '500ml', price: 24.9 },
  { id: '700ml', name: '700ml', price: 28.9 },
]

const ACADAI_TRADICIONAL_ACOMPANHAMENTOS = [
  { id: 'banana', name: 'Banana', price: 0 },
  { id: 'manga', name: 'Manga', price: 0 },
  { id: 'morango', name: 'Morango', price: 0 },
  { id: 'uva', name: 'Uva', price: 0 },
  { id: 'amendoim-triturado', name: 'Amendoim Triturado', price: 0 },
  { id: 'granola', name: 'Granola', price: 0 },
  { id: 'leite-condensado', name: 'Leite Condensado', price: 0 },
  { id: 'leite-em-po', name: 'Leite em Pó', price: 0 },
  { id: 'pacoca-triturada', name: 'Paçoca triturada', price: 0 },
]

const ACADAI_TRADICIONAL_ADICIONAIS = [
  { id: 'amendoim-triturado-ad', name: 'Amendoim Triturado', price: 0 },
  { id: 'bala-beijinho', name: 'Bala Beijinho tipo Fini', price: 3 },
  { id: 'bis', name: 'Bis', price: 3 },
  { id: 'confete', name: 'Confete', price: 3 },
  { id: 'creme-de-avela', name: 'Creme de Avelã', price: 5 },
  { id: 'ferrero-rocher', name: 'Ferrero Rocher', price: 5 },
  { id: 'kit-kat', name: 'Kit Kat', price: 3 },
  { id: 'creme-de-leitinho', name: 'Creme de Leitinho', price: 5 },
  { id: 'trento', name: 'Trento', price: 3 },
  { id: 'brownie', name: 'Brownie', price: 3 },
]

function premiumSizes(prices: [number, number, number, number]) {
  return [
    { id: '300ml', name: '300ml', price: prices[0] },
    { id: '400ml', name: '400ml', price: prices[1] },
    { id: '500ml', name: '500ml', price: prices[2] },
    { id: '700ml', name: '700ml', price: prices[3] },
  ]
}

const PREMIUM_OPTION_GROUPS = [DESCARVEIS]

const GARRAFA_SABORES = [
  { id: 'creme-de-avela', name: 'Creme de Avelã', price: 18 },
  { id: 'leite-condensado', name: 'Leite Condensado', price: 16 },
  { id: 'mousse-de-maracuja', name: 'Mousse de Maracujá', price: 18 },
]

export const PRODUCTS: Product[] = [
  // ── MONTE SEU ACAI ──────────────────────────────────────
  {
    id: 'acai-tradicional',
    slug: 'acai-tradicional',
    name: 'Açaí Tradicional',
    subtitle: 'Monte do seu jeito',
    description:
      'Açaí cremoso e bem gelado, preparado na hora do jeitinho que você gosta! Escolha até 3 acompanhamentos grátis por cima do açaí. Acompanhamentos enviados separados serão cobrados à parte.',
    image: imgAcai,
    category: 'monte-seu-acai',
    available: true,
    price: 17.9,
    fromPrice: true,
    variants: ACADAI_TRADICIONAL_SIZES,
    optionGroups: [
      {
        id: 'acompanhamentos',
        label: 'Acompanhamentos Grátis',
        hint: 'Escolha até 3 acompanhamentos',
        type: 'multi',
        required: false,
        maxSelectable: 3,
        options: ACADAI_TRADICIONAL_ACOMPANHAMENTOS,
      },
      {
        id: 'adicionais',
        label: 'Adicionais',
        hint: 'Deixe seu copo ainda mais irresistível com adicionais',
        type: 'multi',
        required: false,
        options: ACADAI_TRADICIONAL_ADICIONAIS,
      },
      DESCARVEIS,
    ],
  },

  // ── ACAI PREMIUM ────────────────────────────────────────
  {
    id: 'acai-morango-creme-avela',
    slug: 'acai-morango-creme-de-avela',
    name: 'Açaí Morango com Creme de Avelã',
    description:
      'A combinação perfeita do açaí cremoso com morangos frescos, leite condensado e delicioso creme de avelã, trazendo um sabor irresistível e marcante.',
    image: imgAcai1,
    category: 'acai-premium',
    available: true,
    price: 20.9,
    fromPrice: true,
    variants: premiumSizes([20.9, 23.9, 27.9, 31.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-beijinho',
    slug: 'acai-beijinho',
    name: 'Açaí Beijinho',
    description:
      'Delicioso açaí cremoso combinado com creme de chocolate branco, leite em pó e bala tipo Fini beijinho, trazendo um sabor doce, suave e irresistível em cada colherada.',
    image: imgAcai2,
    category: 'acai-premium',
    available: true,
    price: 23.9,
    fromPrice: true,
    variants: premiumSizes([23.9, 27.9, 32.9, 37.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-confete',
    slug: 'acai-confete',
    name: 'Açaí Confete',
    description:
      'Perfeito para quem ama um toque divertido e doce, com deliciosos confetes crocantes que deixam seu açaí ainda mais especial e camada de creme de avelã.',
    image: imgAcai3,
    category: 'acai-premium',
    available: true,
    price: 25.9,
    fromPrice: true,
    variants: premiumSizes([25.9, 29.9, 34.9, 39.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-bis',
    slug: 'acai-bis',
    name: 'Açaí Bis',
    description:
      'Açaí super cremoso acompanhado de camada de creme de avelã e pedaços crocantes de Bis, trazendo a combinação ideal entre cremosidade e crocância.',
    image: imgAcai4,
    category: 'acai-premium',
    available: true,
    price: 25.9,
    fromPrice: true,
    variants: premiumSizes([25.9, 29.9, 34.9, 39.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-granola',
    slug: 'acai-granola',
    name: 'Açaí Granola',
    description:
      'A opção perfeita para quem gosta de equilíbrio, com granola crocante e leite condensado que deixa seu copo ainda mais saboroso e especial.',
    image: imgAcai5,
    category: 'acai-premium',
    available: true,
    price: 20.9,
    fromPrice: true,
    variants: premiumSizes([20.9, 23.9, 27.9, 31.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-ferrero',
    slug: 'acai-ferrero',
    name: 'Açaí Ferrero',
    description:
      'Açaí cremoso combinado com creme de avelã, amendoim e pedaços de Ferrero Rocher, trazendo uma mistura perfeita de chocolate, avelã e crocância em cada colherada.',
    image: imgAcai6,
    category: 'acai-premium',
    available: true,
    price: 25.9,
    fromPrice: true,
    variants: premiumSizes([25.9, 29.9, 34.9, 39.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-trento',
    slug: 'acai-trento',
    name: 'Açaí Trento',
    description:
      'Delicioso açaí com pedaços crocantes de Trento com camada de creme de avelã, proporcionando uma mistura perfeita de chocolate e cremosidade.',
    image: imgAcai8,
    category: 'acai-premium',
    available: true,
    price: 25.9,
    fromPrice: true,
    variants: premiumSizes([25.9, 29.9, 34.9, 39.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-kit-kat',
    slug: 'acai-kit-kat',
    name: 'Açaí Kit Kat',
    description:
      'A união perfeita entre açaí e o crocante irresistível do Kit Kat, com camada de creme de avelã, criando uma sobremesa deliciosa e marcante.',
    image: imgAcai9,
    category: 'acai-premium',
    available: true,
    price: 25.9,
    fromPrice: true,
    variants: premiumSizes([25.9, 29.9, 34.9, 39.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },
  {
    id: 'acai-uva-morango',
    slug: 'acai-uva-e-morango',
    name: 'Açaí Uva e Morango',
    description:
      'Uma combinação refrescante e saborosa com uvas selecionadas, morangos frescos, leite condensado e muito açaí cremoso.',
    image: imgAcai10,
    category: 'acai-premium',
    available: true,
    price: 21.9,
    fromPrice: true,
    variants: premiumSizes([21.9, 24.9, 28.9, 32.9]),
    optionGroups: PREMIUM_OPTION_GROUPS,
  },

  // ── ACAI NA GARRAFA ─────────────────────────────────────
  {
    id: 'acai-garrafa-300',
    slug: 'acai-na-garrafa-300ml',
    name: 'Açaí na Garrafa | 300ml',
    description:
      'Bebida cremosa, refrescante e perfeita para qualquer momento do dia.',
    image: imgAcai11,
    category: 'acai-na-garrafa',
    available: true,
    price: 16,
    fromPrice: true,
    variants: GARRAFA_SABORES,
    optionGroups: [DESCARVEIS],
  },

  // ── COPO DA FELICIDADE ──────────────────────────────────
  {
    id: 'copo-doce-de-leite',
    slug: 'copo-da-felicidade-doce-de-leite',
    name: 'Copo da Felicidade Doce de Leite',
    price: 17,
    fromPrice: false,
    category: 'copo-da-felicidade',
    available: true,
    variants: [],
    optionGroups: [],
  },
  {
    id: 'copo-chocolate-amendoim',
    slug: 'copo-da-felicidade-chocolate-amendoim',
    name: 'Copo da Felicidade Creme de Chocolate com Amendoim',
    price: 17,
    fromPrice: false,
    category: 'copo-da-felicidade',
    available: true,
    variants: [],
    optionGroups: [],
  },
  {
    id: 'copo-premium-morango-uva',
    slug: 'copo-da-felicidade-premium-morangos-e-uva',
    name: 'Copo da Felicidade Premium Morangos e Uva',
    price: 18,
    fromPrice: false,
    category: 'copo-da-felicidade',
    available: true,
    variants: [],
    optionGroups: [],
  },

  // ── FONDUE ──────────────────────────────────────────────
  {
    id: 'fondue-na-roleta',
    slug: 'fondue-na-roleta',
    name: 'Fondue na Roleta',
    description:
      'Uma combinação de brownie, creme de avelã, creme de ninho, uva verde e morangos.',
    image: imgFondue,
    price: 25.9,
    fromPrice: false,
    category: 'fondue',
    available: true,
    variants: [],
    optionGroups: [],
  },

  // ── BEBIDAS ─────────────────────────────────────────────
  {
    id: 'agua-sem-gas',
    slug: 'agua-sem-gas',
    name: 'Água sem Gás',
    image: imgAgua,
    price: 4.99,
    fromPrice: false,
    category: 'bebidas',
    available: true,
    variants: [],
    optionGroups: [],
  },
  {
    id: 'agua-com-gas',
    slug: 'agua-com-gas',
    name: 'Água com Gás',
    image: imgAguaGas,
    price: 5.99,
    fromPrice: false,
    category: 'bebidas',
    available: true,
    variants: [],
    optionGroups: [],
  },
]