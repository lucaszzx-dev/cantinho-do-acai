import type { Category } from '../types/domain'

interface CategoryNavProps {
  categories: Category[]
  activeId: string
  onSelect: (id: string) => void
}

export function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Categorias">
      <ul className="category-nav__list">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className={`category-nav__item ${
                activeId === category.id ? 'category-nav__item--active' : ''
              }`}
              aria-pressed={activeId === category.id}
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
