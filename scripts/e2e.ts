import { existsSync } from "fs"
import {
  SETUP_TIMEOUT_MS,
  SETUP_TIMEOUT_MIN,
  AUTH_FILE,
} from "./e2e-constants"
const args = process.argv.slice(2)

const PROJECTS = [
  "--project=authenticated",
  "--project=unauthenticated",
  "--project=mobile",
]

// ─── Helpers ────────────────────────────────────────────

function sessionExists(): boolean {
  return existsSync(AUTH_FILE)
}

function printBanner(): void {
  console.log(`
╔════════════════════════════════════════════╗
║       E2E Auth Setup Required             ║
║                                           ║
║  A browser will open.                     ║
║  You have ${SETUP_TIMEOUT_MIN} minutes to log in with       ║
║  Google and save your session.            ║
╚════════════════════════════════════════════╝
`)
}

function run(cmd: string[]): number {
  return Bun.spawnSync(cmd, { stdio: ["inherit", "inherit", "inherit"] }).exitCode
}

// ─── Modes ──────────────────────────────────────────────

function runSetup(): never {
  printBanner()
  run(["bunx", "playwright", "test", "--project=setup", "--headed"])

  if (!sessionExists()) {
    console.log("\n✗ Setup failed — session not saved.")
    process.exit(1)
  }

  console.log("\n✓ Session saved. Re-running full suite...\n")
  process.exit(run(["bun", "run", "test:e2e", ...args]))
}

function runTests(): never {
  const flags = args.length > 0 ? args : PROJECTS
  process.exit(run(["bunx", "playwright", "test", ...flags]))
}

// ─── Main ───────────────────────────────────────────────

if (sessionExists()) runTests()
else runSetup()
