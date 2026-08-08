/**
 * Central store configuration.
 *
 * Commercial details marked as MOCK/PENDING here are not yet confirmed by the
 * shop. Change them in this single file and the whole app updates.
 */

export const STORE = {
  name: 'Cantinho do Açaí',
  city: 'Taboão da Serra',
  tagline: 'Felicidade vem no copo',
  deliveryMode: 'Apenas Delivery',
  whatsappNumber: '5511980169607',
  whatsappDisplay: '11 98016-9607',
  minOrder: 16,
  /**
   * Placeholder used until the shop confirms its delivery/opening hours.
   *
   * `openNow` is MOCK. Swap this block for real logic later (compare the
   * current time against `opensAt`/`closesAt`). Keep `pending: true` until the
   * official schedule is confirmed.
   */
  schedule: {
    label: 'Horário de funcionamento',
    value: '18:00 às 21:00 — dias pendentes de confirmação',
    pending: true,
    override: 'auto',
    days: {},
  },
  /** MOCK — pending official store address. */
  address: {
    label: 'Endereço',
    /** MOCK — pending official street address. */
    value: 'Taboão da Serra – SP',
    pending: true,
  },
  /** Pending commercial configuration: the administrator activates methods. */
  paymentMethods: [
    { id: 'pix', label: 'Pix', active: false, order: 0, instruction: '', pixKey: '' },
    { id: 'cash', label: 'Dinheiro', active: false, order: 1, instruction: '', pixKey: '' },
    { id: 'debit', label: 'Débito', active: false, order: 2, instruction: '', pixKey: '' },
    { id: 'credit', label: 'Crédito', active: false, order: 3, instruction: '', pixKey: '' },
  ],
  /** MOCK — pending delivery fee rules by neighborhood. */
  deliveryNote:
    'Taxa de entrega calculada no ato da confirmação do pedido pelo WhatsApp.',
}
