import { PowerSyncDatabase } from "@powersync/web"
import { AppSchema } from "@/lib/powersync/schema"
import { BackendConnector } from "@/lib/powersync/connector"

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: "trojes.sqlite",
    disableSSRWarning: true,
    worker: "/@powersync/worker.js",
  },
  sync: {
    worker: "/@powersync/worker.js",
  },
})

export const connector = new BackendConnector()
