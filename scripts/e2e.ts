import { existsSync } from "fs"
import { resolve } from "path"

const AUTH_FILE = resolve("tests/e2e/.auth/user.json")
const args = process.argv.slice(2)

if (!existsSync(AUTH_FILE)) {
  console.log("")
  console.log("No session found. Running auth setup...")
  console.log("A browser will open - log in with Google.")
  console.log("")

  const setup = Bun.spawnSync(["bunx", "playwright", "test", "--project=setup", "--headed"], {
    stdio: ["inherit", "inherit", "inherit"],
  })

  if (!existsSync(AUTH_FILE)) {
    console.log("")
    console.log("Setup failed - session not saved.")
    process.exit(1)
  }

  console.log("")
  console.log("Session saved. Running full test suite...")
  console.log("")
}

const pwArgs = args.length > 0 ? args : []
const result = Bun.spawnSync(["bunx", "playwright", "test", ...pwArgs], {
  stdio: ["inherit", "inherit", "inherit"],
})

process.exit(result.exitCode)
