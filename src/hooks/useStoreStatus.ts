import { STORE } from '../data/storeConfig'

export type StoreStatus = 'open' | 'closed' | 'unknown'

interface StoreStatusResult {
  status: StoreStatus
  label: string
}

/**
 * Resolves the store open/closed status for display.
 *
 * Currently the schedule is MOCK and configured in `storeConfig.ts`. When the
 * official schedule is confirmed, compute `status` here by comparing the
 * current time against `schedule.opensAt` / `schedule.closesAt` and return
 * e.g. "Abre às 15:00" for the closed state. For now we surface the configured
 * value without inventing a definitive schedule.
 */
export function useStoreStatus(): StoreStatusResult {
  const { schedule } = STORE

  if (schedule.pending) {
    return { status: 'unknown', label: schedule.value }
  }

  return { status: 'unknown', label: schedule.value }
}
