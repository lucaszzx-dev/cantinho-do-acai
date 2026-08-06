import { STORE } from '../data/storeConfig'
import type { CheckoutData } from '../types/domain'

interface CheckoutFormProps {
  value: CheckoutData
  onChange: (next: CheckoutData) => void
}

export function CheckoutForm({ value, onChange }: CheckoutFormProps) {
  const update = (field: keyof CheckoutData, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  return (
    <form className="checkout-form" onSubmit={(event) => event.preventDefault()}>
      <h3 className="checkout-form__title">Dados de entrega</h3>

      <div className="field">
        <label className="field__label" htmlFor="checkout-name">
          Nome *
        </label>
        <input
          id="checkout-name"
          className="field__input"
          value={value.name}
          onChange={(event) => update('name', event.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="checkout-phone">
          Telefone / WhatsApp *
        </label>
        <input
          id="checkout-phone"
          className="field__input"
          type="tel"
          inputMode="tel"
          value={value.phone}
          onChange={(event) => update('phone', event.target.value)}
          autoComplete="tel"
          placeholder="(11) 90000-0000"
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="checkout-address">
          Endereço *
        </label>
        <input
          id="checkout-address"
          className="field__input"
          value={value.address}
          onChange={(event) => update('address', event.target.value)}
          autoComplete="street-address"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label" htmlFor="checkout-number">
            Número *
          </label>
          <input
            id="checkout-number"
            className="field__input"
            value={value.number}
            onChange={(event) => update('number', event.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="checkout-complement">
            Complemento
          </label>
          <input
            id="checkout-complement"
            className="field__input"
            value={value.complement}
            onChange={(event) => update('complement', event.target.value)}
            placeholder="Apto, casa, bloco"
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="checkout-neighborhood">
          Bairro *
        </label>
        <input
          id="checkout-neighborhood"
          className="field__input"
          value={value.neighborhood}
          onChange={(event) => update('neighborhood', event.target.value)}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="checkout-notes">
          Observações
        </label>
        <textarea
          id="checkout-notes"
          className="field__input field__input--textarea"
          rows={3}
          value={value.notes}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="Ex.: ponto de referência, restrições…"
        />
      </div>

      <fieldset className="field field--radio">
        <legend className="field__label">Forma de pagamento *</legend>
        <div className="field__radios">
          {STORE.paymentMethods.map((method) => (
            <label key={method.id} className="field__radio">
              <input
                type="radio"
                name="payment"
                value={method.label}
                checked={value.paymentMethod === method.label}
                onChange={() => update('paymentMethod', method.label)}
              />
              <span>{method.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="checkout-form__note">{STORE.deliveryNote}</p>
    </form>
  )
}
