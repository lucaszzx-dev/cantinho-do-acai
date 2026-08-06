import { useMemo, useState } from 'react'
import {
  ACADAI_SIZES,
  COBERTURAS,
  COMPLEMENTS,
  FRUITS,
  MAX_COMPLEMENTS,
  MAX_FRUITS,
} from '../data/monteSeuAcai'
import type { PriceOption, Product } from '../types/domain'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { Modal } from './Modal'

interface MonteSeuAcaiModalProps {
  product: Product
  onClose: () => void
  onAdded: () => void
}

const STEPS = ['Tamanho', 'Complementos', 'Frutas', 'Cobertura', 'Revisão']

export function MonteSeuAcaiModal({ product, onClose, onAdded }: MonteSeuAcaiModalProps) {
  const { addItem } = useCart()
  const [step, setStep] = useState(0)
  const [sizeId, setSizeId] = useState(ACADAI_SIZES[0]?.id ?? '')
  const [complementIds, setComplementIds] = useState<string[]>([])
  const [fruitIds, setFruitIds] = useState<string[]>([])
  const [toppingId, setToppingId] = useState(COBERTURAS[0]?.id ?? '')

  const selectedSize = ACADAI_SIZES.find((size) => size.id === sizeId)
  const selectedComplements = COMPLEMENTS.filter((option) => complementIds.includes(option.id))
  const selectedFruits = FRUITS.filter((option) => fruitIds.includes(option.id))
  const selectedTopping = COBERTURAS.find((option) => option.id === toppingId)

  const basePrice = selectedSize?.price ?? product.price
  const extrasTotal = [...selectedComplements, ...selectedFruits].reduce(
    (sum, option) => sum + option.price,
    0,
  )
  const toppingPrice = selectedTopping?.price ?? 0
  const finalPrice = useMemo(
    () => basePrice + extrasTotal + toppingPrice,
    [basePrice, extrasTotal, toppingPrice],
  )

  const toggleInArray = (
    current: string[],
    id: string,
    max: number,
    setter: (next: string[]) => void,
  ) => {
    if (current.includes(id)) {
      setter(current.filter((candidate) => candidate !== id))
    } else if (current.length < max) {
      setter([...current, id])
    }
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

  const canContinue = step !== 0 || !!selectedSize

  return (
    <Modal title={product.name} onClose={onClose} className="modal--builder">
      <div className="modal__header">
        <h2 className="modal__title">{product.name}</h2>
        <button type="button" className="modal__close" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
      </div>

      <ol className="builder-steps" aria-label="Etapas do pedido">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={`builder-steps__item ${
              index === step ? 'builder-steps__item--active' : ''
            } ${index < step ? 'builder-steps__item--done' : ''}`}
          >
            <span className="builder-steps__number">{index < step ? '✓' : index + 1}</span>
            <span className="builder-steps__label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="builder">
        {step === 0 && (
          <fieldset className="builder__group">
            <legend className="builder__legend">Escolha o tamanho</legend>
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
        )}

        {step === 1 && (
          <StepSelection
            title="Complementos"
            hint={`Escolha até ${MAX_COMPLEMENTS} complementos`}
            options={COMPLEMENTS}
            selectedIds={complementIds}
            max={MAX_COMPLEMENTS}
            onToggle={(id) => toggleInArray(complementIds, id, MAX_COMPLEMENTS, setComplementIds)}
          />
        )}

        {step === 2 && (
          <StepSelection
            title="Frutas"
            hint={`Escolha até ${MAX_FRUITS} frutas`}
            options={FRUITS}
            selectedIds={fruitIds}
            max={MAX_FRUITS}
            onToggle={(id) => toggleInArray(fruitIds, id, MAX_FRUITS, setFruitIds)}
          />
        )}

        {step === 3 && (
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
        )}

        {step === 4 && (
          <div className="builder-review">
            <h3 className="builder-review__title">Revise seu pedido</h3>
            <ul className="builder-review__list">
              <li>
                <span className="builder-review__key">Tamanho</span>
                <span>{selectedSize?.name}</span>
              </li>
              <li>
                <span className="builder-review__key">Preço base</span>
                <span>{formatCurrency(basePrice)}</span>
              </li>
              <li>
                <span className="builder-review__key">Complementos</span>
                <span>
                  {selectedComplements.length > 0
                    ? selectedComplements.map((o) => o.name).join(', ')
                    : 'Nenhum'}
                </span>
              </li>
              <li>
                <span className="builder-review__key">Frutas</span>
                <span>
                  {selectedFruits.length > 0 ? selectedFruits.map((o) => o.name).join(', ') : 'Nenhuma'}
                </span>
              </li>
              <li>
                <span className="builder-review__key">Cobertura</span>
                <span>{selectedTopping?.name}</span>
              </li>
              <li>
                <span className="builder-review__key">Adicionais</span>
                <span>+{formatCurrency(extrasTotal + toppingPrice)}</span>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="modal__footer modal__footer--stack">
        <div className="builder-nav">
          {step > 0 && (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setStep((current) => current - 1)}
            >
              Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="button button--primary"
              disabled={!canContinue}
              onClick={() => setStep((current) => current + 1)}
            >
              Continuar
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={handleSubmit}>
              Adicionar ao carrinho
            </button>
          )}
        </div>
        <div className="modal__total">
          <span className="modal__total-label">Total</span>
          <strong className="modal__total-value">{formatCurrency(finalPrice)}</strong>
        </div>
      </div>
    </Modal>
  )
}

interface StepSelectionProps {
  title: string
  hint: string
  options: PriceOption[]
  selectedIds: string[]
  max: number
  onToggle: (id: string) => void
}

function StepSelection({ title, hint, options, selectedIds, max, onToggle }: StepSelectionProps) {
  return (
    <fieldset className="builder__group">
      <legend className="builder__legend">{title}</legend>
      <div className="builder__meta">
        <span className="builder__count" aria-live="polite">
          {selectedIds.length}/{max}
        </span>
        <p className="builder__hint">{hint}</p>
      </div>
      <div className="builder__options">
        {options.map((option) => {
          const selected = selectedIds.includes(option.id)
          const disabled = !selected && selectedIds.length >= max
          return (
            <label
              key={option.id}
              className={`option-chip ${selected ? 'option-chip--selected' : ''} ${
                disabled ? 'option-chip--disabled' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled}
                onChange={() => onToggle(option.id)}
              />
              <span className="option-chip__label">{option.name}</span>
              {option.price > 0 && (
                <span className="option-chip__price">+{formatCurrency(option.price)}</span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
