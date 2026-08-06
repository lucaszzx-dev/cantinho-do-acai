import { useMemo, useState } from 'react'
import { CategoryNav } from './components/CategoryNav'
import { FloatingCart } from './components/FloatingCart'
import { MonteSeuAcaiModal } from './components/MonteSeuAcaiModal'
import { ProductDetailsModal } from './components/ProductDetailsModal'
import { ProductSection } from './components/ProductSection'
import { SearchBar } from './components/SearchBar'
import { StoreHeader } from './components/StoreHeader'
import { WelcomeBanner } from './components/WelcomeBanner'
import { CartProvider } from './context/CartContext'
import { CATEGORIES } from './data/categories'
import { useSearch } from './hooks/useSearch'
import { CartPage } from './pages/CartPage'
import type { Product } from './types/domain'

function MenuPage() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'menu' | 'cart'>('menu')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [toast, setToast] = useState('')

  const searchResults = useSearch(query)
  const isSearching = query.trim().length > 0

  const groupedProducts = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        products: searchResults.filter(
          (product) => product.category === category.id,
        ),
      })),
    [searchResults],
  )

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

  return (
    <div className="page">
      <StoreHeader />
      <main className="page__main">
        <WelcomeBanner />
        <SearchBar value={query} onChange={setQuery} />
        {!isSearching && <CategoryNav categories={CATEGORIES} onSelect={handleCategorySelect} />}

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
              <span className="search-empty__icon" aria-hidden="true">🍧</span>
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

      {selectedProduct?.category === 'monte-seu-acai' ? (
        <MonteSeuAcaiModal
          product={selectedProduct}
          onClose={closeModal}
          onAdded={handleAdded}
        />
      ) : selectedProduct ? (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={closeModal}
          onAdded={handleAdded}
        />
      ) : null}

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
