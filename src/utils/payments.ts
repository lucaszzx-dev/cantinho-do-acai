const labels: Record<string, string> = { cash: 'Dinheiro', pix: 'Pix', debit: 'Débito', credit: 'Crédito' }

export function formatPaymentMethod(value: string) { return labels[value] ?? value }
