import { saveOrderToken } from './orderTokens'

type PersistedOrder = { orderNumber: number; publicAccessToken: string }

export function completePersistedOrder(order: PersistedOrder, message: string, effects: { openWhatsApp: (message: string) => void; clearCart: () => void; navigate: (path: string) => void }) {
  effects.openWhatsApp(message)
  saveOrderToken(order.publicAccessToken)
  effects.clearCart()
  effects.navigate(`/pedido/${order.publicAccessToken}`)
}
