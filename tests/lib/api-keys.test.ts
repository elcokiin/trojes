import { describe, it, expect } from "vitest"
import { generateApiKey, hashApiKey } from "@/lib/api-keys"

describe("generateApiKey", () => {
  it('returns a key matching trojes_[a-f0-9]{48}', () => {
    const key = generateApiKey()
    expect(key).toMatch(/^trojes_[a-f0-9]{48}$/)
  })

  it("generates unique keys across multiple calls", () => {
    const keys = Array.from({ length: 1000 }, () => generateApiKey())
    expect(new Set(keys).size).toBe(1000)
  })

  it("includes only hex characters after the prefix", () => {
    const key = generateApiKey()
    const suffix = key.slice(6)
    expect(suffix).toMatch(/^[a-f0-9]+$/)
    expect(suffix).toHaveLength(48)
  })
})

describe("hashApiKey", () => {
  it("returns a 64-character hex string", () => {
    const hash = hashApiKey("trojes_test_key")
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it("is deterministic: same input produces same hash", () => {
    const key = generateApiKey()
    expect(hashApiKey(key)).toBe(hashApiKey(key))
  })

  it("produces different hashes for different keys", () => {
    const keyA = "trojes_a"
    const keyB = "trojes_b"
    expect(hashApiKey(keyA)).not.toBe(hashApiKey(keyB))
  })

  it("handles empty string input", () => {
    const hash = hashApiKey("")
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })
})

describe("generateApiKey + hashApiKey integration", () => {
  it("no collision in 1000 generated-and-hashed keys", () => {
    const hashes = Array.from({ length: 1000 }, () => hashApiKey(generateApiKey()))
    expect(new Set(hashes).size).toBe(1000)
  })
})
