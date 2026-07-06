import crypto from "crypto"
import { findUserIdByApiKeyHash, markApiKeyUsed } from "@/db/api-keys"

export function generateApiKey(): string {
  return `trojes_${crypto.randomBytes(24).toString("hex")}`
}

export function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex")
}

export async function getUserIdFromApiKey(apiKey: string): Promise<string | null> {
  const keyHash = hashApiKey(apiKey)
  const userId = await findUserIdByApiKeyHash(keyHash)

  if (!userId) {
    return null
  }

  await markApiKeyUsed(keyHash)

  return userId
}
