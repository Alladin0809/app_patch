import type { ReactNode } from 'react'

/**
 * StoreProvider wraps app with any shared context.
 * State is managed by zustand (wallet.store, sysInfo.store); this is a pass-through.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
