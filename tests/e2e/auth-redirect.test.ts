import { test, expect } from "@playwright/test"

// Mirar components/login/google-sign-in-button.tsx → GOOGLE_BTN_SELECTOR
const GOOGLE_BTN = "#gbtn"

test.describe("Auth redirect", () => {
  test("unauthenticated user at / redirects to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/login")
    await expect(page.locator(GOOGLE_BTN)).toBeVisible()
  })

  test("unauthenticated user at /login stays at /login", async ({ page }) => {
    await page.goto("/login")
    await expect(page).toHaveURL("/login")
    await expect(page.locator(GOOGLE_BTN)).toBeVisible()
  })

  test("unauthenticated access to non-existent page redirects to /login", async ({ page }) => {
    await page.goto("/some-random-page")
    await expect(page).toHaveURL("/login")
  })
})
