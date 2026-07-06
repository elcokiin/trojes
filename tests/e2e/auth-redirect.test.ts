import { test, expect } from "@playwright/test"

test.describe("Auth redirect", () => {
  test("unauthenticated user at / redirects to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL("/login")
    await expect(page.getByText("Welcome to Trojes")).toBeVisible()
  })

  test("unauthenticated user at /login stays at /login", async ({ page }) => {
    await page.goto("/login")
    await expect(page).toHaveURL("/login")
    await expect(page.getByText("Continue with Google")).toBeVisible()
  })

  test("unauthenticated access to non-existent page redirects to /login", async ({ page }) => {
    await page.goto("/some-random-page")
    await expect(page).toHaveURL("/login")
  })
})
