import { z } from 'zod'

export const paymentMethodSchema = z.object({
  id: z.enum(['pix', 'cash', 'debit', 'credit']),
  label: z.string().trim().min(1).max(60),
  active: z.boolean(),
  order: z.number().int().min(0),
  instruction: z.string().trim().max(500).optional().default(''),
  pixKey: z.string().trim().max(200).optional().default(''),
})

export const paymentMethodsSchema = z.array(paymentMethodSchema).length(4).superRefine((methods, context) => {
  if (new Set(methods.map((method) => method.id)).size !== methods.length) context.addIssue({ code: 'custom', message: 'Métodos de pagamento duplicados.' })
})

export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export function publicPaymentMethods(value: unknown): PaymentMethod[] {
  const parsed = paymentMethodsSchema.safeParse(value)
  if (!parsed.success) return []
  return parsed.data.filter((method) => method.active).sort((a, b) => a.order - b.order).map((method) => ({ ...method, pixKey: method.id === 'pix' ? method.pixKey : '' }))
}

export function paymentMethodIsActive(value: unknown, id: string) {
  return publicPaymentMethods(value).some((method) => method.id === id)
}
