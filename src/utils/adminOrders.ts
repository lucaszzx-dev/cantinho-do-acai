export const activeOrderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'] as const
export const completedOrderStatuses = ['delivered', 'cancelled'] as const
export function isTerminalOrder(status: string) { return completedOrderStatuses.includes(status as typeof completedOrderStatuses[number]) }
export function filterOrdersByQueue<T extends { status: string }>(orders: T[], queue: 'active' | 'completed') { return orders.filter((order) => queue === 'active' ? activeOrderStatuses.includes(order.status as typeof activeOrderStatuses[number]) : isTerminalOrder(order.status)) }
export type CompletedDateFilter = 'today' | 'yesterday' | 'week' | 'all' | 'date'
const dayKey = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
export function filterAdminOrders<T extends { status: string; createdAt: string | Date }>(orders: T[], queue: 'active' | 'completed', dateFilter: CompletedDateFilter, selectedDate: string, now = new Date()) {
  const today = dayKey(now); const yesterday = dayKey(new Date(now.getTime() - 86_400_000)); const weekStart = new Date(now.getTime() - 6 * 86_400_000)
  return filterOrdersByQueue(orders, queue).filter((order) => {
    if (queue !== 'completed' || dateFilter === 'all') return true
    const date = new Date(order.createdAt), key = dayKey(date)
    if (dateFilter === 'today') return key === today
    if (dateFilter === 'yesterday') return key === yesterday
    if (dateFilter === 'week') return date >= weekStart && date <= now
    return key === selectedDate
  })
}
export function summarizeCompletedOrders<T extends { status: string; totalCents: number }>(orders: T[]) { const delivered = orders.filter((order) => order.status === 'delivered'); return { deliveredCount: delivered.length, deliveredTotalCents: delivered.reduce((sum, order) => sum + order.totalCents, 0), cancelledCount: orders.filter((order) => order.status === 'cancelled').length } }
export function completedSummaryLabel(dateFilter: CompletedDateFilter, selectedDate: string) { if (dateFilter === 'today') return 'Resumo de hoje'; if (dateFilter === 'yesterday') return 'Resumo de ontem'; if (dateFilter === 'week') return 'Resumo dos últimos 7 dias'; if (dateFilter === 'all') return 'Resumo geral'; return selectedDate ? `Resumo de ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(`${selectedDate}T12:00:00`))}` : 'Resumo da data selecionada' }
