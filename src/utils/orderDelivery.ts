export function buildMapsRouteUrl(address: string, number: string, neighborhood: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${number}, ${neighborhood}`)}`
}

export function isAllowedOrderStatus(status: string) {
  return ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'].includes(status)
}
