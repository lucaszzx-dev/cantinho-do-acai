export type Schedule = { override?: 'auto' | 'open' | 'closed'; message?: string; days?: Record<string, { enabled: boolean; opensAt: string; closesAt: string }> }
export function storeStatus(schedule: Schedule, now = new Date()) {
  if (schedule.override === 'open') return { status: 'open', label: 'Aberto agora', nextChange: null }
  if (schedule.override === 'closed') return { status: 'closed', label: schedule.message || 'Fechado temporariamente', nextChange: null }
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const weekday = parts.find((p) => p.type === 'weekday')!.value.toLowerCase().slice(0, 3)
  const time = `${parts.find((p) => p.type === 'hour')!.value}:${parts.find((p) => p.type === 'minute')!.value}`
  const today = schedule.days?.[weekday]
  if (!today?.enabled) return { status: 'closed', label: 'Fechado · horário não configurado', nextChange: null }
  const crossesMidnight = today.closesAt <= today.opensAt
  const open = crossesMidnight ? time >= today.opensAt || time < today.closesAt : time >= today.opensAt && time < today.closesAt
  return open ? { status: 'open', label: `Aberto agora · fecha às ${today.closesAt}`, nextChange: today.closesAt } : { status: 'closed', label: `Fechado · abre hoje às ${today.opensAt}`, nextChange: today.opensAt }
}
