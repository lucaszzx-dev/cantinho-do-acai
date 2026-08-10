const imagesByProductId: Record<string, string> = {
  'acai-tradicional': '/images/products/acai-tradicional.png', 'acai-morango-creme-avela': '/images/products/acai-morango-creme-avela.png', 'acai-beijinho': '/images/products/acai-beijinho.png', 'acai-confete': '/images/products/acai-confete.png', 'acai-bis': '/images/products/acai-bis.png', 'acai-granola': '/images/products/acai-granola.png', 'acai-ferrero': '/images/products/acai-ferrero-rocher.png', 'acai-trento': '/images/products/acai-trento.png', 'acai-kit-kat': '/images/products/acai-kitkat.png', 'acai-uva-morango': '/images/products/acai-uva-morango.png', 'acai-garrafa-300': '/images/products/acai-na-garrafa.png', 'copo-doce-de-leite': '/images/products/copo-doce-de-leite.png', 'copo-chocolate-amendoim': '/images/products/copo-chocolate-amendoim.png', 'copo-premium-morango-uva': '/images/products/copo-morango-uva.png', 'fondue-na-roleta': '/images/products/fondue-na-roleta.png', 'agua-sem-gas': '/images/products/agua-sem-gas.avif', 'agua-com-gas': '/images/products/agua-com-gas.avif',
}

export function productImageFor(id: string, fallback?: string) { return imagesByProductId[id] ?? fallback }
export { imagesByProductId }
