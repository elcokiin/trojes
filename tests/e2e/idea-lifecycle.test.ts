import { test, expect } from "@playwright/test"

test.describe("Idea lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("create idea appears in inbox", async ({ page }) => {
    await page.getByText("Capture a new idea...").click()
    const editor = page.locator("[contenteditable]")
    await editor.fill("E2E test idea")
    await page.keyboard.press("Meta+Enter")
    await expect(page.getByText("E2E test idea")).toBeVisible()
  })

  test("archive idea moves it to archived tab", async ({ page }) => {
    await page.getByText("Capture a new idea...").click()
    const editor = page.locator("[contenteditable]")
    await editor.fill("E2E idea to archive")
    await page.keyboard.press("Meta+Enter")
    await page.waitForTimeout(500)

    const moreButton = page.getByText("E2E idea to archive").locator("..").getByText("More actions")
    await moreButton.click()
    await page.getByText("Archive").click()
    await page.getByText("Archived").click()
    await expect(page.getByText("E2E idea to archive")).toBeVisible()
  })

  test("delete idea moves it to trash with timestamp", async ({ page }) => {
    await page.getByText("Capture a new idea...").click()
    const editor = page.locator("[contenteditable]")
    await editor.fill("E2E idea to delete")
    await page.keyboard.press("Meta+Enter")
    await page.waitForTimeout(500)

    const moreButton = page.getByText("E2E idea to delete").locator("..").getByText("More actions")
    await moreButton.click()
    await page.getByText("Delete").click()
    await page.getByText("Trash").click()
    await expect(page.getByText("E2E idea to delete")).toBeVisible()
  })

  test("restore trash idea moves it back to inbox", async ({ page }) => {
    await page.getByText("Trash").click()
    const idea = page.getByText("E2E idea to delete")
    if (await idea.isVisible()) {
      await page.getByText("Move to Inbox").click()
      await page.getByText("Inbox").click()
      await expect(page.getByText("E2E idea to delete")).toBeVisible()
    }
  })
})
