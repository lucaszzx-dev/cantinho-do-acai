import { describe, expect, it } from 'vitest'
import { completedSummaryLabel, filterAdminOrders, filterOrdersByQueue, isTerminalOrder, summarizeCompletedOrders } from './adminOrders'
import { formatPaymentMethod } from './payments'

describe('admin order presentation', () => {
  it('translates internal payment identifiers', () => expect([formatPaymentMethod('cash'), formatPaymentMethod('pix'), formatPaymentMethod('debit'), formatPaymentMethod('credit')]).toEqual(['Dinheiro', 'Pix', 'Débito', 'Crédito']))
  it('separates active and terminal orders', () => { const orders = [{ status: 'pending' }, { status: 'delivered' }, { status: 'cancelled' }]; expect(filterOrdersByQueue(orders, 'active')).toHaveLength(1); expect(filterOrdersByQueue(orders, 'completed')).toHaveLength(2); expect(isTerminalOrder('delivered')).toBe(true) })
  it('filters completed orders by Sao Paulo calendar dates', () => { const now = new Date('2026-08-12T15:00:00Z'); const orders = [{ status: 'delivered', createdAt: '2026-08-12T12:00:00Z' }, { status: 'cancelled', createdAt: '2026-08-11T12:00:00Z' }]; expect(filterAdminOrders(orders, 'completed', 'today', '', now)).toHaveLength(1); expect(filterAdminOrders(orders, 'completed', 'yesterday', '', now)).toHaveLength(1) })
  it('summarizes the selected completed period and excludes cancelled value', () => { const orders = [{ status: 'delivered', totalCents: 3390 }, { status: 'cancelled', totalCents: 5000 }, { status: 'delivered', totalCents: 1200 }]; expect(summarizeCompletedOrders(orders)).toEqual({ deliveredCount: 2, deliveredTotalCents: 4590, cancelledCount: 1 }); expect(completedSummaryLabel('today', '')).toBe('Resumo de hoje'); expect(completedSummaryLabel('yesterday', '')).toBe('Resumo de ontem'); expect(completedSummaryLabel('week', '')).toBe('Resumo dos últimos 7 dias'); expect(completedSummaryLabel('date', '2026-08-12')).toBe('Resumo de 12/08/2026'); expect(completedSummaryLabel('all', '')).toBe('Resumo geral') })
})
