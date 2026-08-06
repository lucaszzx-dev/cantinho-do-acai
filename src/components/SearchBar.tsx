interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar">
      <label className="sr-only" htmlFor="product-search">
        Buscar produto
      </label>
      <div className="search-bar__field">
        <span className="search-bar__icon" aria-hidden="true">
          🔍
        </span>
        <input
          id="product-search"
          type="search"
          placeholder="Digite para buscar um item"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
