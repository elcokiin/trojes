import crypto from "crypto"
import * as Effect from "effect/Effect"
import { findUserIdByApiKeyHash, markApiKeyUsed } from "@/db/api-keys"
import { DatabaseError } from "@/lib/errors"

export function generateApiKey(): string {
  return `trojes_${crypto.randomBytes(24).toString("hex")}`
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export const getUserIdFromApiKey = (apiKey: string) =>
  Effect.gen(function* () {
    const keyHash = hashApiKey(apiKey)
    const userId = yield* findUserIdByApiKeyHash(keyHash)

    if (!userId) {
      return null
    }

    yield* markApiKeyUsed(keyHash)
    return userId
  }).pipe(
    Effect.catch((cause) => new DatabaseError({ cause, query: "getUserIdFromApiKey" })),
  )
