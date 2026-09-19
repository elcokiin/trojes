import { Effect, Layer } from "effect"
import { OfflineIdentityLive } from "./outbox/offline-identity"
import { SyncServiceLive } from "./outbox/sync"
import { IdeasCacheControllerLive } from "./outbox/ideas-cache-controller"

export const AppLayer = Layer.mergeAll(
  OfflineIdentityLive,
  SyncServiceLive,
  IdeasCacheControllerLive,
)

export function runEffect<A>(effect: Effect.Effect<A, any, never>): Promise<A> {
  return Effect.runPromise(effect as Effect.Effect<A, never, never>)
}