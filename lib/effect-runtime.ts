import { Effect, Layer } from "effect"
import { OfflineIdentityLive } from "./outbox/offline-identity"
import { SyncServiceLive } from "./outbox/sync"

export const AppLayer = Layer.merge(OfflineIdentityLive, SyncServiceLive)

export function runEffect<A>(effect: Effect.Effect<A, any, never>): Promise<A> {
  return Effect.runPromise(effect as Effect.Effect<A, never, never>)
}
