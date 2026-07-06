import { defineConfig, devices } from "@playwright/test"

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
      timeout: 120_000,
      use: {
        launchOptions: {
          executablePath: "/usr/bin/chromium",
          args: ["--disable-blink-features=AutomationControlled"],
        },
      },
    },
    {
      name: "authenticated",
      dependencies: ["setup"],
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
      dependencies: ["setup"],
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
