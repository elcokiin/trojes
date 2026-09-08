import { Data } from "effect"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly cause: unknown
  readonly query?: string
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
  readonly message: string
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resource: string
  readonly id?: string
}> {}
