import { UpdateType } from "@powersync/web"
import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from "@powersync/web"

const UPLOAD_URL = "/api/powersync/upload"

export class BackendConnector implements PowerSyncBackendConnector {
  async fetchCredentials(): Promise<PowerSyncCredentials> {
    const res = await fetch("/api/powersync/token", { cache: "no-store" })

    if (!res.ok) {
      throw new Error(`Failed to get PowerSync credentials: ${res.status}`)
    }

    const body = (await res.json()) as {
      endpoint: string
      token: string
    }

    return {
      endpoint: body.endpoint,
      token: body.token,
    }
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction()
    if (!transaction) return

    try {
      const operations = transaction.crud.map((op) => ({
        id: op.id,
        op: op.op,
        table: op.table,
        opData: op.opData,
      }))

      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operations }),
      })

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)

      const result = (await res.json()) as { success: boolean; errors?: string[] }

      if (!result.success) {
        console.warn("Upload had errors:", result.errors)
      }

      await transaction.complete()
    } catch (ex) {
      throw ex
    }
  }
}
