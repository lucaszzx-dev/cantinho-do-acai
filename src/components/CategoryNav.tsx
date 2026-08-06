import type { Category } from '../types/domain'

interface CategoryNavProps {
  categories: Category[]
  onSelect: (id: string) => void
}

export function CategoryNav({ categories, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Categorias">
      <ul className="category-nav__list">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              type="button"
              className="category-nav__item"
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
