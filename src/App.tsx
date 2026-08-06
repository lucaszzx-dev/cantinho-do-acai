import { useEffect, useMemo, useRef, useState } from 'react'
import { CategoryNav } from './components/CategoryNav'
import { FloatingCart } from './components/FloatingCart'
import { ProductConfigurator } from './components/ProductConfigurator'
import { ProductDetailsModal } from './components/ProductDetailsModal'
import { ProductSection } from './components/ProductSection'
import { SearchBar } from './components/SearchBar'
import { StoreHeader } from './components/StoreHeader'
import { WelcomeBanner } from './components/WelcomeBanner'
import { CartProvider } from './context/CartContext'
import { CATEGORIES } from './data/categories'
import { PRODUCTS } from './data/products'
import { catalogApi } from './api/catalog'
import { useSearch } from './hooks/useSearch'
import { CartPage } from './pages/CartPage'
import type { Product } from './types/domain'

function MenuPage() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'menu' | 'cart'>('menu')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState('')
  const [activeId, setActiveId] = useState('')
  const [categories, setCategories] = useState(CATEGORIES)
  const [products, setProducts] = useState(PRODUCTS)
  const [catalogError, setCatalogError] = useState(false)

  const mainRef = useRef<HTMLElement>(null)

  const searchResults = useSearch(query, products)
  const isSearching = query.trim().length > 0

  const groupedProducts = useMemo(
    () =>
      categories.map((category) => ({
        category,
        products: searchResults.filter(
          (product) => product.category === category.id,
        ),
      })),
    [categories, searchResults],
  )

  useEffect(() => {
    Promise.all([catalogApi.categories(), catalogApi.products()])
      .then(([apiCategories, apiProducts]) => { setCategories(apiCategories); setProducts(apiProducts) })
      .catch(() => setCatalogError(true))
  }, [])

  useEffect(() => {
    if (view !== 'menu' || isSearching) return
    const onScroll = () => {
      const offset = 120
      let current = ''
      for (const category of categories) {
        const element = document.getElementById(category.id)
        if (element && element.getBoundingClientRect().top <= offset) {
          current = category.id
        }
      }
      setActiveId(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [view, isSearching, categories])

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  const handleChoose = (product: Product) => {
    setSelectedProduct(product)
  }

  const closeModal = () => setSelectedProduct(null)

  const handleAdded = () => {
    showToast('Item adicionado ao carrinho 💜')
  }

  const handleCategorySelect = (id: string) => {
    setQuery('')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (view === 'cart') {
    return (
      <div className="page">
        <CartPage onBack={() => setView('menu')} />
      </div>
    )
  }

  const hasResults = searchResults.length > 0
  const hasConfig = (p: Product) =>
    p.variants.length > 0 || p.optionGroups.length > 0

  return (
    <div className="page">
      <StoreHeader />
      <main ref={mainRef} className="page__main">
        <WelcomeBanner />
        {catalogError && <p className="catalog-notice">Catálogo local temporário em uso.</p>}
        <SearchBar value={query} onChange={setQuery} />
        {!isSearching && (
          <CategoryNav
            categories={categories}
            activeId={activeId}
            onSelect={handleCategorySelect}
          />
        )}

        {isSearching ? (
          hasResults ? (
            <div className="product-grid">
              {searchResults.map((product) => (
                <ProductSection
                  key={product.id}
                  category={{ id: product.category, name: '' }}
                  products={[product]}
                  onChoose={handleChoose}
                />
              ))}
            </div>
          ) : (
            <div className="search-empty">
              <span className="search-empty__icon" aria-hidden="true">
                🍧
              </span>
              <p className="search-empty__title">Nenhum item encontrado</p>
              <p className="search-empty__text">
                Tente buscar por outro nome, sabor ou categoria.
              </p>
            </div>
          )
        ) : (
          groupedProducts.map(({ category, products }) => (
            <ProductSection
              key={category.id}
              category={category}
              products={products}
              onChoose={handleChoose}
            />
          ))
        )}
      </main>

      <FloatingCart onOpen={() => setView('cart')} />

      {selectedProduct &&
        (hasConfig(selectedProduct) ? (
          <ProductConfigurator
            product={selectedProduct}
            onClose={closeModal}
            onAdded={handleAdded}
          />
        ) : (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={closeModal}
            onAdded={handleAdded}
          />
        ))}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <MenuPage />
    </CartProvider>
  )
}
