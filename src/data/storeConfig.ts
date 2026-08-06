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
  /** Placeholder used until the shop confirms its delivery/opening hours. */
  hours: {
    label: 'Horário de funcionamento',
    /** MOCK — pending official schedule. */
    value: 'Consulte o WhatsApp',
    pending: true,
  },
  /** MOCK — pending official store address. */
  address: {
    label: 'Endereço',
    /** MOCK — pending official street address. */
    value: 'Taboão da Serra – SP',
    pending: true,
  },
  /** MOCK — pending official payment methods. */
  paymentMethods: [
    { id: 'pix', label: 'Pix' },
    { id: 'dinheiro', label: 'Dinheiro' },
    { id: 'cartao', label: 'Cartão de crédito / débito (na entrega)' },
  ],
  /** MOCK — pending delivery fee rules by neighborhood. */
  deliveryNote:
    'Taxa de entrega calculada no ato da confirmação do pedido pelo WhatsApp.',
}
