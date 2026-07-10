import { test as setup } from "@playwright/test"

// Mirar components/login/google-sign-in-button.tsx → GOOGLE_BTN_SELECTOR
const GOOGLE_BTN = "#gbtn"

const authFile = "tests/e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  setup.setTimeout(120_000)
  await page.goto("/login")
  await page.locator(GOOGLE_BTN).waitFor({ state: "visible" })

  await page.locator(GOOGLE_BTN).click()
  await page.waitForURL("/", { timeout: 120_000 })

  await page.context().storageState({ path: authFile })
})
