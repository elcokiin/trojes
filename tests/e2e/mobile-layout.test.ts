import { test, expect } from "@playwright/test"

test.describe("Mobile layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("shows bottom navigation bar on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const bottomNav = page.locator('[data-slot="bottom-nav"]')
    await expect(bottomNav).toBeVisible()
  })

  test("mobile layout has swipeable tabs", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const tabs = page.locator('[role="tablist"]')
    await expect(tabs).toBeVisible()
  })

  test("pinned tray opens as drawer on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const pinnedButton = page.getByText(/pinned/i)
    if (await pinnedButton.isVisible()) {
      await pinnedButton.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }
  })
})
