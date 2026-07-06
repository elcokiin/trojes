import { test, expect } from "@playwright/test";

async function openApiKeysSection(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.keyboard.press("s");
  await page.getByRole("button", { name: "API Keys" }).click();
}

test.describe("API key flow", () => {
  test.beforeEach(async ({ page }) => {
    await openApiKeysSection(page);
  });

  test("create key shows full key once and allows copy", async ({ page }) => {
    const keyName = `E2E Test Key ${crypto.randomUUID()}`;
    await page.getByPlaceholder("e.g. n8n local workflow").fill(keyName);
    await page.getByText("Create", { exact: true }).click();
    const fullKey = page.locator("code").first();
    await expect(fullKey).toBeVisible();
    await expect(fullKey).toContainText(/trojes_/);
  });

  test("delete key removes it from the list", async ({ page }) => {
    const keyName = `E2E To Delete ${crypto.randomUUID()}`;
    await page.getByPlaceholder("e.g. n8n local workflow").fill(keyName);
    await page.getByText("Create", { exact: true }).click();
    const keyCard = page.locator("div").filter({ hasText: keyName }).first();
    await expect(keyCard).toBeVisible();
    await keyCard.getByRole("button").last().click();
    await expect(keyCard).not.toBeVisible();
  });

  test("can use API key to create idea with source=api", async ({ page }) => {
    const keyName = `E2E API Key ${crypto.randomUUID()}`;
    await page.getByPlaceholder("e.g. n8n local workflow").fill(keyName);
    await page.getByText("Create", { exact: true }).click();
    const rawKey = await page.locator("code").first().textContent();
    const apiKey = rawKey?.trim();
    expect(apiKey).toMatch(/^trojes_/);

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
