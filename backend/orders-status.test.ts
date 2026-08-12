import { describe, expect, it } from 'vitest'
import { orderStatusTransitions } from './orders.js'

describe('order status transitions', () => {
  it('allows only the next operational state or cancellation before completion', () => {
    expect(orderStatusTransitions.pending).toEqual(['confirmed', 'cancelled'])
    expect(orderStatusTransitions.confirmed).toEqual(['preparing', 'cancelled'])
    expect(orderStatusTransitions.preparing).toEqual(['ready', 'cancelled'])
    expect(orderStatusTransitions.ready).toEqual(['out_for_delivery', 'delivered'])
    expect(orderStatusTransitions.out_for_delivery).toEqual(['delivered'])
  })

  it('does not allow a terminal order to transition again', () => {
    expect(orderStatusTransitions.delivered).toEqual([])
    expect(orderStatusTransitions.cancelled).toEqual([])
  })

  it('rejects status skips such as confirmed directly to delivered', () => {
    expect(orderStatusTransitions.confirmed).not.toContain('delivered')
  })
})
