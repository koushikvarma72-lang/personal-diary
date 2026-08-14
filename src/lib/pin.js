// Optional PIN lock — a deterrent, not real security (client-side only).
// The PIN itself is never stored; only a SHA-256 hash of it.
const LS_PIN = 'dd_pin_hash'
const SS_UNLOCKED = 'dd_unlocked'

export async function hashPin(pin) {
  const data = new TextEncoder().encode('daily-discipline:' + pin)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const getPinHash = () => localStorage.getItem(LS_PIN)

export async function setPin(pin) {
  localStorage.setItem(LS_PIN, await hashPin(pin))
}

export const clearPin = () => localStorage.removeItem(LS_PIN)

export const isUnlockedThisSession = () => sessionStorage.getItem(SS_UNLOCKED) === '1'
export const unlockSession = () => sessionStorage.setItem(SS_UNLOCKED, '1')
export const lockSession = () => sessionStorage.removeItem(SS_UNLOCKED)
