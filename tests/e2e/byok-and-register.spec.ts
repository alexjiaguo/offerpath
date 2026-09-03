import { expect, test } from "@playwright/test";
import path from "node:path";

// Portable: use the bundled Chromium (no absolute Chrome path) and write
// screenshots into the repo's test-results dir (no absolute user paths).
test.describe("BYOK and Register UI verification", () => {
  test("register page renders shortened center-aligned bullet points", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Unlimited job tracking")).toBeVisible();
    await expect(page.getByText("AI resume tailoring")).toBeVisible();
    await expect(page.getByText("Mock interview prep")).toBeVisible();
    await expect(page.getByText("No credit card needed")).toBeVisible();

    await page.screenshot({
      path: path.join("test-results", "register_preview.png"),
    });
  });

  test("settings api-keys page renders OpenAI and Anthropic compatible options", async ({ page }) => {
    await page.goto("/dashboard/settings/api-keys");
    const addBtn = page.getByRole("button", { name: /Add AI Key|添加 API Key/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
    }
    await expect(page.getByRole("button", { name: /OpenAI Compatible/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Anthropic Compatible/i })).toBeVisible();

    await page.screenshot({
      path: path.join("test-results", "api_keys_preview.png"),
    });
  });
});
