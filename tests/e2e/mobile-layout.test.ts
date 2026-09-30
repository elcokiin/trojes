import { test, expect } from "@playwright/test"

test.describe("Mobile layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
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

  test("swipe up on /mobile navigates to /dashboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/mobile")
    await page.waitForLoadState("networkidle")

    const box = await page.locator("body").boundingBox()
    if (!box) throw new Error("No body box")
    const cx = box.x + box.width / 2
    const startY = box.y + box.height * 0.7
    const endY = box.y + box.height * 0.2

    await page.touchscreen.tap(cx, startY)
    await page.mouse.move(cx, startY)
    await page.mouse.down()
    await page.mouse.move(cx, endY, { steps: 10 })
    await page.mouse.up()

    await expect(page).toHaveURL(/\/dashboard/)
    const tabs = page.locator('[role="tablist"]')
    await expect(tabs).toBeVisible()
  })

  test("Write tile on /mobile opens the capture page", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/mobile")
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Write" }).click()

    await expect(page).toHaveURL(/\/mobile\/capture\?from=mobile/)
    await expect(page.getByText("Create")).toBeVisible()
  })

  test("quick capture button on mobile dashboard opens the capture page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    const bottomNav = page.locator('[data-slot="bottom-nav"]')
    await expect(bottomNav).toBeVisible()

    await page.getByText("Capture a new idea...").click()

    await expect(page).toHaveURL(/\/mobile\/capture\?from=dashboard/)
    await expect(page.getByText("Create")).toBeVisible()
  })

  test("cancel on the capture page returns to the previous page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/mobile")
    await page.waitForLoadState("networkidle")

    await page.getByRole("button", { name: "Write" }).click()
    await expect(page).toHaveURL(/\/mobile\/capture/)

    await page.getByText("Cancel").click()

    await expect(page).toHaveURL(/\/mobile$/)
  })
})
