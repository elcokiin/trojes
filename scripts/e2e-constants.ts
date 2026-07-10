import { resolve } from "path"

export const SETUP_TIMEOUT_MS = 120_000
export const SETUP_TIMEOUT_MIN = SETUP_TIMEOUT_MS / 60_000
export const AUTH_FILE = resolve("tests/e2e/.auth/user.json")
