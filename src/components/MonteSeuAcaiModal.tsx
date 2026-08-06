import { useMemo, useState } from 'react'
import {
  COBERTURAS,
  COMPLEMENTS,
  FRUITS,
  ACADAI_SIZES,
} from '../data/monteSeuAcai'
import type { Product } from '../types/domain'
import { formatCurrency } from '../utils/format'
import { useCart } from '../hooks/useCart'

interface MonteSeuAcaiModalProps {
  product: Product
  onClose: () => void
  onAdded: () => void
}

export function MonteSeuAcaiModal({ product, onClose, onAdded }: MonteSeuAcaiModalProps) {
  const { addItem } = useCart()
  const [sizeId, setSizeId] = useState(ACADAI_SIZES[0]?.id ?? '')
  const [complementIds, setComplementIds] = useState<string[]>([])
  const [fruitIds, setFruitIds] = useState<string[]>([])
  const [toppingId, setToppingId] = useState(COBERTURAS[0]?.id ?? '')

  const selectedSize = ACADAI_SIZES.find((size) => size.id === sizeId)

  const selectedComplements = COMPLEMENTS.filter((option) =>
    complementIds.includes(option.id),
  )
  const selectedFruits = FRUITS.filter((option) => fruitIds.includes(option.id))
  const selectedTopping = COBERTURAS.find((option) => option.id === toppingId)

  const finalPrice = useMemo(() => {
    const base = selectedSize?.price ?? product.price
    const extrasTotal = [...selectedComplements, ...selectedFruits].reduce(
      (sum, option) => sum + option.price,
      0,
    )
    const toppingPrice = selectedTopping?.price ?? 0
    return base + extrasTotal + toppingPrice
  }, [product.price, selectedSize, selectedComplements, selectedFruits, selectedTopping])

  const toggleInArray = (
    current: string[],
    id: string,
    setter: (next: string[]) => void,
  ) => {
    setter(
      current.includes(id)
        ? current.filter((candidate) => candidate !== id)
        : [...current, id],
    )
  }

  const handleSubmit = () => {
    if (!selectedSize) return
    const extras = [
      ...selectedComplements.map((option) => ({ id: option.id, label: option.name, price: option.price })),
      ...selectedFruits.map((option) => ({ id: option.id, label: option.name, price: option.price })),
      ...(selectedTopping && selectedTopping.id !== 'sem-cobertura'
        ? [{ id: selectedTopping.id, label: selectedTopping.name, price: selectedTopping.price }]
        : []),
    ]
    addItem({
      productId: product.id,
      name: `${product.name} · ${selectedSize.name}`,
      unitPrice: finalPrice,
      extras,
      fromPrice: false,
    })
    onAdded()
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal modal--builder"
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="builder-title" className="modal__title">
            {product.name}
          </h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Fechar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="builder">
          <fieldset className="builder__group">
            <legend className="builder__legend">Tamanho</legend>
            <div className="builder__options builder__options--grid">
              {ACADAI_SIZES.map((size) => (
                <label
                  key={size.id}
                  className={`option-chip ${sizeId === size.id ? 'option-chip--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={size.id}
                    checked={sizeId === size.id}
                    onChange={() => setSizeId(size.id)}
                  />
                  <span className="option-chip__label">{size.name}</span>
                  <span className="option-chip__price">{formatCurrency(size.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <OptionGroup
            legend="Complementos"
            options={COMPLEMENTS}
            selectedIds={complementIds}
            onToggle={(id) => toggleInArray(complementIds, id, setComplementIds)}
          />

          <OptionGroup
            legend="Frutas"
            options={FRUITS}
            selectedIds={fruitIds}
            onToggle={(id) => toggleInArray(fruitIds, id, setFruitIds)}
          />

          <fieldset className="builder__group">
            <legend className="builder__legend">Cobertura</legend>
            <div className="builder__options">
              {COBERTURAS.map((option) => (
                <label
                  key={option.id}
                  className={`option-chip ${toppingId === option.id ? 'option-chip--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="topping"
                    value={option.id}
                    checked={toppingId === option.id}
                    onChange={() => setToppingId(option.id)}
                  />
                  <span className="option-chip__label">{option.name}</span>
                  {option.price > 0 && (
                    <span className="option-chip__price">+{formatCurrency(option.price)}</span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="modal__footer">
          <div className="modal__price">
            <span className="modal__price-label">Total</span>
            <strong className="modal__price-value">{formatCurrency(finalPrice)}</strong>
          </div>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSubmit}
            disabled={!selectedSize}
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  )
}

interface OptionGroupProps {
  legend: string
  options: { id: string; name: string; price: number }[]
  selectedIds: string[]
  onToggle: (id: string) => void
}

function OptionGroup({ legend, options, selectedIds, onToggle }: OptionGroupProps) {
  return (
    <fieldset className="builder__group">
      <legend className="builder__legend">{legend}</legend>
      <div className="builder__options">
        {options.map((option) => (
          <label
            key={option.id}
            className={`option-chip ${selectedIds.includes(option.id) ? 'option-chip--selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(option.id)}
              onChange={() => onToggle(option.id)}
            />
            <span className="option-chip__label">{option.name}</span>
            {option.price > 0 && (
              <span className="option-chip__price">+{formatCurrency(option.price)}</span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

