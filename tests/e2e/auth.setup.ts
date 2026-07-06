import { test as setup } from "@playwright/test"

const authFile = "tests/e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  await page.goto("/login")
  await page.waitForSelector('text="Welcome to Troje"')

  await page.getByText("Continue with Google").click()
  await page.waitForURL("/")

  await page.context().storageState({ path: authFile })
})
