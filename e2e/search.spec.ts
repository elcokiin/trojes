import { test, expect } from "@playwright/test"

test.describe("Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("pressing f opens search input", async ({ page }) => {
    await page.keyboard.press("f")
    const searchInput = page.getByPlaceholder(/search/i)
    await expect(searchInput).toBeVisible()
    await expect(searchInput).toBeFocused()
  })

  test("typing keyword filters the ideas list", async ({ page }) => {
    await page.keyboard.press("f")
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill("test")
    await page.waitForTimeout(400)
    const searchParam = new URL(page.url()).searchParams.get("search")
    expect(searchParam).toBe("test")
  })

  test("clear search restores full list", async ({ page }) => {
    await page.keyboard.press("f")
    const searchInput = page.getByPlaceholder(/search/i)
    await searchInput.fill("test")
    await page.waitForTimeout(400)
    await page.getByLabel(/clear/i).click()
    const searchParam = new URL(page.url()).searchParams.get("search")
    expect(searchParam).toBeNull()
  })
})
