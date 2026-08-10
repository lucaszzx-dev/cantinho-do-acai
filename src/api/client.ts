export const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiRequest(path: string, init: RequestInit = {}) {
  return fetch(`${apiUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: { ...(init.body === undefined ? {} : { 'content-type': 'application/json' }), ...init.headers },
  })
}
