import { test, expect } from "@playwright/test";

test.describe("API key flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("create key shows full key once and allows copy", async ({ page }) => {
    await page.goto("/settings");
    await page.getByPlaceholder("e.g. n8n local workflow").fill("E2E Test Key");
    await page.getByText("Create", { exact: true }).click();
    const fullKey = page.locator("code").first();
    await expect(fullKey).toBeVisible();
    await expect(fullKey).toContainText(/troje_/);
  });

  test("delete key removes it from the list", async ({ page }) => {
    await page.goto("/settings");
    const keyName = page.getByText("E2E Test Key");
    if (await keyName.isVisible()) {
      const deleteButton = keyName.locator("..").getByText("Delete");
      await deleteButton.click();
      await expect(keyName).not.toBeVisible();
    }
  });

  test("can use API key to create idea with source=api", async ({
    page,
    context,
  }) => {
    await page.goto("/settings");
    const keyName = page.getByText("E2E Test Key");
    if (!(await keyName.isVisible())) {
      await page
        .getByPlaceholder("e.g. n8n local workflow")
        .fill("E2E Test Key");
      await page.getByText("Create", { exact: true }).click();
    }
    const rawKey = await page.locator("code").first().textContent();
    const apiKey = rawKey?.trim();
    expect(apiKey).toMatch(/^troje_/);

    const res = await page.request.post("/api/ideas", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      data: { content: "Created via E2E API key test" },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.idea.source).toBe("api");
  });
});
