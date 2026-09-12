import { Context, Effect, Layer } from "effect"
import { OfflineIdentityError } from "@/lib/errors"

const STORAGE_KEY = "trojes:offline-user-id"

export interface OfflineIdentityOps {
  readonly getCachedUserId: () => Effect.Effect<string | null, OfflineIdentityError>
  readonly setCachedUserId: (userId: string) => Effect.Effect<void, OfflineIdentityError>
  readonly clearCachedUserId: () => Effect.Effect<void, OfflineIdentityError>
  readonly isOnline: () => Effect.Effect<boolean, OfflineIdentityError>
  readonly resolveUserId: () => Effect.Effect<string | null, OfflineIdentityError>
}

export const OfflineIdentity = Context.Service<OfflineIdentityOps>("OfflineIdentity")

function localStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key)
}

function localStorageSet(key: string, value: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, value)
}

function localStorageRemove(key: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(key)
}

const localStorageGetEffect = (key: string): Effect.Effect<string | null, OfflineIdentityError> =>
  Effect.try({
    try: () => localStorageGet(key),
    catch: (cause) => new OfflineIdentityError({ cause }),
  })

const localStorageSetEffect = (key: string, value: string): Effect.Effect<void, OfflineIdentityError> =>
  Effect.try({
    try: () => localStorageSet(key, value),
    catch: (cause) => new OfflineIdentityError({ cause }),
  })

const localStorageRemoveEffect = (key: string): Effect.Effect<void, OfflineIdentityError> =>
  Effect.try({
    try: () => localStorageRemove(key),
    catch: (cause) => new OfflineIdentityError({ cause }),
  })

const fetchSessionEffect: Effect.Effect<string | null, OfflineIdentityError> =
  Effect.tryPromise({
    try: async () => {
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      return session?.user?.id ?? null
    },
    catch: (cause) => new OfflineIdentityError({ cause }),
  })

export const OfflineIdentityLive = Layer.succeed(
  OfflineIdentity,
  {
    getCachedUserId: () => localStorageGetEffect(STORAGE_KEY),

    setCachedUserId: (userId: string) => localStorageSetEffect(STORAGE_KEY, userId),

    clearCachedUserId: () => localStorageRemoveEffect(STORAGE_KEY),

    isOnline: () =>
      Effect.try({
        try: () => {
          if (typeof window === "undefined") return true
          return navigator.onLine
        },
        catch: (cause) => new OfflineIdentityError({ cause }),
      }),

    resolveUserId: () =>
      Effect.gen(function* () {
        const cached = yield* localStorageGetEffect(STORAGE_KEY)

        const remoteId = yield* fetchSessionEffect.pipe(
          Effect.catch(() => Effect.succeed(null)),
        )

        if (remoteId) {
          yield* localStorageSetEffect(STORAGE_KEY, remoteId)
          return remoteId
        }

        return cached
      }),
  },
)
