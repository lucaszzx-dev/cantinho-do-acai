const key = 'cantinho-do-acai-order-tokens'
export function saveOrderToken(token: string) { const current = loadOrderTokens(); if (!current.includes(token)) localStorage.setItem(key, JSON.stringify([token, ...current])) }
export function loadOrderTokens(): string[] { try { const value = JSON.parse(localStorage.getItem(key) ?? '[]'); return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [] } catch { return [] } }
export function removeOrderToken(token: string) { localStorage.setItem(key, JSON.stringify(loadOrderTokens().filter((item) => item !== token))) }
