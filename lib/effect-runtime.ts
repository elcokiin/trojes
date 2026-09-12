import { Layer } from "effect"
import { OfflineIdentityLive } from "./outbox/offline-identity"
import { SyncServiceLive } from "./outbox/sync"

export const AppLayer = Layer.merge(OfflineIdentityLive, SyncServiceLive)
