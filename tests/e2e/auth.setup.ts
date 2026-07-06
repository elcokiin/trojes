import { test as setup } from "@playwright/test"

const authFile = "tests/e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  setup.setTimeout(120_000)
  await page.goto("/login")
  await page.waitForSelector('text="Welcome to Trojes"')

  await page.getByText("Continue with Google").click()
  await page.waitForURL("/", { timeout: 120_000 })

  await page.context().storageState({ path: authFile })
})
