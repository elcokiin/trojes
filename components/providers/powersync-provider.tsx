"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { PowerSyncContext } from "@powersync/react"
import { db, connector } from "@/lib/powersync/db"
import {
  clearCachedUserId,
  getCachedUserId,
  setCachedUserId,
} from "@/lib/offline-identity"

export function PowerSyncProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return
    const sessionUserId = session.user.id
    const cachedUserId = getCachedUserId()

    const connect = () => {
      setCachedUserId(sessionUserId)
      db.connect(connector).catch((error) => {
        // Offline or transient token failure: capture still works locally,
        // sync retries automatically once connectivity returns.
        console.error("PowerSync connect failed:", error)
      })
    }

    if (cachedUserId && cachedUserId !== sessionUserId) {
      // A different, server-confirmed user signed in on this device. Wipe the
      // previous user's local mirror before connecting so nothing leaks into
      // the new account. Unlike the unauthenticated path, "authenticated" with
      // a mismatched cached id can only happen on a real user switch.
      clearCachedUserId()
      db.disconnectAndClear()
        .catch((error) => {
          console.error("Failed to clear local PowerSync data on user switch:", error)
        })
        .finally(connect)
      return
    }

    connect()
  }, [status, session?.user?.id])

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
}
