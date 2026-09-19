import { Data } from "effect"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
  readonly query?: string
}> {}

export class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly cause: unknown
  readonly url?: string
}> {}

export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly cause: unknown
  readonly operation: string
}> {}

export class SyncError extends Data.TaggedError("SyncError")<{
  readonly cause: unknown
  readonly itemId?: string
}> {}

export class OfflineIdentityError extends Data.TaggedError("OfflineIdentityError")<{
  readonly cause: unknown
}> {}

export class IdeasCacheError extends Data.TaggedError("IdeasCacheError")<{
  readonly cause: unknown
  readonly operation: string
}> {}
