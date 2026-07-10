import { defineConfig, devices } from "@playwright/test"
import { SETUP_TIMEOUT_MS } from "./scripts/e2e-constants"

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/e2e-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      timeout: SETUP_TIMEOUT_MS,
      use: {
        launchOptions: {
          args: ["--disable-blink-features=AutomationControlled"],
        },
      },
    },
    {
      name: "authenticated",
      testIgnore: ["auth-redirect.test.ts", "auth.setup.ts"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
    {
      name: "unauthenticated",
      testMatch: ["auth-redirect.test.ts"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: undefined,
      },
    },
    {
      name: "mobile",
      testMatch: ["mobile-layout.test.ts"],
      use: {
        ...devices["iPhone 13"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
