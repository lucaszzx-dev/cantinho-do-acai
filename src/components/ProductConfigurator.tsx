import { useMemo, useState } from 'react'
import type { OptionGroup, Product } from '../types/domain'
import { useCart } from '../hooks/useCart'
import { formatCurrency } from '../utils/format'
import { unitPrice, optionsTotal, buildFromPrice } from '../utils/pricing'
import { Modal } from './Modal'

interface ProductConfiguratorProps {
  product: Product
  onClose: () => void
  onAdded: () => void
}

export function ProductConfigurator({ product, onClose, onAdded }: ProductConfiguratorProps) {
  const { addItem } = useCart()
  const [step, setStep] = useState(0)
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '')
  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(product.optionGroups.map((g) => [g.id, []])),
  )

  const selectedVariant = product.variants.find((v) => v.id === variantId)
  const variantPrice = selectedVariant?.price ?? buildFromPrice(product)
  const optionGroups = product.optionGroups

  const stepLabels = useMemo(() => {
    const labels: string[] = []
    if (product.variants.length > 0) {
      labels.push(product.category === 'acai-na-garrafa' ? 'Sabor' : 'Tamanho')
    }
    for (const group of optionGroups) {
      labels.push(group.label)
    }
    labels.push('Revisão')
    return labels
  }, [product.variants.length, product.category, optionGroups])

  const variantStep = product.variants.length > 0 ? 0 : -1
  const reviewStep = stepLabels.length - 1
  const firstOptionGroupIdx = variantStep + 1

  const currentGroup: OptionGroup | undefined =
    step >= firstOptionGroupIdx && step <= reviewStep - 1
      ? optionGroups[step - firstOptionGroupIdx]
      : undefined

  const unit = unitPrice(variantPrice, optionGroups, selections)
  const extrasTotal = optionsTotal(optionGroups, selections)

  function toggleMulti(groupId: string, optionId: string, max?: number) {
    setSelections((prev) => {
      const current = prev[groupId] ?? []
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : current.length < (max ?? Infinity)
          ? [...current, optionId]
          : current
      return { ...prev, [groupId]: next }
    })
  }

  function selectSingle(groupId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [groupId]: [optionId] }))
  }

  const canContinue = (() => {
    if (step === variantStep) return !!variantId
    if (step === reviewStep) return true
    if (!currentGroup) return true
    if (currentGroup.required) return (selections[currentGroup.id] ?? []).length > 0
    return true
  })()

  function handleSubmit() {
    if (!product.available) return
    if (!selectedVariant && product.variants.length > 0) return
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      category: product.category,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      selections,
      unitPrice: unit,
    })
    onAdded()
    onClose()
  }

  return (
    <Modal title={product.name} onClose={onClose} className="modal--builder">
      <div className="modal__header">
        <h2 className="modal__title">{product.name}</h2>
        <button type="button" className="modal__close" aria-label="Fechar" onClick={onClose}>
          ✕
        </button>
      </div>

      <ol className="builder-steps" aria-label="Etapas do pedido">
        {stepLabels.map((label, index) => (
          <li
            key={label}
            className={`builder-steps__item ${index === step ? 'builder-steps__item--active' : ''} ${index < step ? 'builder-steps__item--done' : ''}`}
          >
            <span className="builder-steps__number">
              {index < step ? '✓' : index + 1}
            </span>
            <span className="builder-steps__label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="builder">
        {step === variantStep && product.variants.length > 0 && (
          <fieldset className="builder__group">
            <legend className="builder__legend">
              {product.category === 'acai-na-garrafa' ? 'Escolha o sabor' : 'Escolha o tamanho'}
            </legend>
            <div className="builder__options builder__options--grid">
              {product.variants.map((v) => (
                <label
                  key={v.id}
                  className={`option-chip ${variantId === v.id ? 'option-chip--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={variantId === v.id}
                    onChange={() => setVariantId(v.id)}
                  />
                  <span className="option-chip__label">{v.name}</span>
                  <span className="option-chip__price">{formatCurrency(v.price)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {currentGroup && (
          <OptionGroupStep
            group={currentGroup}
            selected={selections[currentGroup.id] ?? []}
            onToggle={(optionId) => {
              if (currentGroup.type === 'single') {
                selectSingle(currentGroup.id, optionId)
              } else {
                toggleMulti(currentGroup.id, optionId, currentGroup.maxSelectable)
              }
            }}
          />
        )}

        {step === reviewStep && (
          <div className="builder-review">
            <h3 className="builder-review__title">Revise seu pedido</h3>
            <ul className="builder-review__list">
              {selectedVariant && (
                <li>
                  <span className="builder-review__key">
                    {product.category === 'acai-na-garrafa' ? 'Sabor' : 'Tamanho'}
                  </span>
                  <span>{selectedVariant.name}</span>
                </li>
              )}
              <li>
                <span className="builder-review__key">Preço base</span>
                <span>{formatCurrency(variantPrice)}</span>
              </li>
              {optionGroups.map((group) => {
                const ids = selections[group.id] ?? []
                if (ids.length === 0) return null
                const labels = ids
                  .map((id) => group.options.find((o) => o.id === id)?.name)
                  .filter(Boolean)
                return (
                  <li key={group.id}>
                    <span className="builder-review__key">{group.label}</span>
                    <span>{labels.join(', ')}</span>
                  </li>
                )
              })}
              {extrasTotal > 0 && (
                <li>
                  <span className="builder-review__key">Adicionais</span>
                  <span>+${formatCurrency(extrasTotal)}</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="modal__footer modal__footer--stack">
        <div className="builder-nav">
          {step > 0 && (
            <button type="button" className="button button--ghost" onClick={() => setStep((s) => s - 1)}>
              Voltar
            </button>
          )}
          {step < reviewStep ? (
            <button
              type="button"
              className="button button--primary"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuar
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={handleSubmit} disabled={!product.available}>
              Adicionar ao carrinho
            </button>
          )}
        </div>
        <div className="modal__total">
          <span className="modal__total-label">Total</span>
          <strong className="modal__total-value">{formatCurrency(unit)}</strong>
        </div>
      </div>
    </Modal>
  )
}

interface OptionGroupStepProps {
  group: OptionGroup
  selected: string[]
  onToggle: (optionId: string) => void
}

function OptionGroupStep({ group, selected, onToggle }: OptionGroupStepProps) {
  const isMulti = group.type === 'multi'
  const max = group.maxSelectable

  return (
    <fieldset className="builder__group">
      <legend className="builder__legend">{group.label}</legend>
      {isMulti && max !== undefined && (
        <div className="builder__meta">
          <span className="builder__count" aria-live="polite">
            {selected.length}/{max}
          </span>
          {group.hint && <p className="builder__hint">{group.hint}</p>}
        </div>
      )}
      {!isMulti && group.hint && <p className="builder__hint">{group.hint}</p>}
      <div className="builder__options">
        {group.options.map((option) => {
          const isSelected = selected.includes(option.id)
          const disabled = isMulti && max !== undefined && !isSelected && selected.length >= max

          if (isMulti) {
            return (
              <label
                key={option.id}
                className={`option-chip ${isSelected ? 'option-chip--selected' : ''} ${disabled ? 'option-chip--disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onToggle(option.id)}
                />
                <span className="option-chip__label">{option.name}</span>
                {option.price > 0 && (
                  <span className="option-chip__price">+${formatCurrency(option.price)}</span>
                )}
              </label>
            )
          }

          return (
            <label
              key={option.id}
              className={`option-chip ${isSelected ? 'option-chip--selected' : ''}`}
            >
              <input
                type="radio"
                name={`group-${group.id}`}
                value={option.id}
                checked={isSelected}
                onChange={() => onToggle(option.id)}
              />
              <span className="option-chip__label">{option.name}</span>
              {option.price > 0 && (
                <span className="option-chip__price">+${formatCurrency(option.price)}</span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
