"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { PowerSyncContext } from "@powersync/react"
import { db, connector } from "@/lib/powersync/db"
import {
  clearCachedUserId,
  getCachedUserId,
  isOnline,
  setCachedUserId,
} from "@/lib/offline-identity"

export function PowerSyncProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.id) setCachedUserId(session.user.id)
      db.connect(connector).catch((error) => {
        // Offline or transient token failure: capture still works locally,
        // sync retries automatically once connectivity returns.
        console.error("PowerSync connect failed:", error)
      })
      return
    }

    if (status === "unauthenticated") {
      // A failed session fetch (offline) also reports "unauthenticated".
      // Only wipe the local mirror when we are online and the server
      // confirmed there is no session; otherwise keep cached identity and
      // local data so capture keeps working offline.
      if (isOnline()) {
        clearCachedUserId()
        db.disconnectAndClear().catch((error) => {
          console.error("Failed to clear local PowerSync data:", error)
        })
      } else if (!getCachedUserId()) {
        // Offline with no known identity: nothing to capture as this user.
        db.disconnectAndClear().catch((error) => {
          console.error("Failed to clear local PowerSync data:", error)
        })
      }
    }
  }, [status, session?.user?.id])

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>
}
