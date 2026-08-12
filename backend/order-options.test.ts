import { describe, expect, it } from 'vitest'
import { resolveOrderOptionLabels } from './order-options.js'

describe('persisted order option labels', () => {
  it('resolves stored option IDs for the admin and customer order details', () => {
    expect(resolveOrderOptionLabels([{ groupId: 'acompanhamentos', id: 'banana' }, { groupId: 'adicionais', id: 'creme-de-avela' }], [{ id: 'acai-tradicional:acompanhamentos:banana', name: 'Banana' }, { id: 'acai-tradicional:adicionais:creme-de-avela', name: 'Creme de Avelã' }])).toEqual(['Banana', 'Creme de Avelã'])
  })
})
