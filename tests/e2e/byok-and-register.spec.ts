import { expect, test } from "@playwright/test";

test.use({
  launchOptions: {
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  },
});

test.describe("BYOK and Register UI verification", () => {
  test("register page renders shortened center-aligned bullet points", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Unlimited job tracking")).toBeVisible();
    await expect(page.getByText("AI resume tailoring")).toBeVisible();
    await expect(page.getByText("Mock interview prep")).toBeVisible();
    await expect(page.getByText("No credit card needed")).toBeVisible();

    await page.screenshot({
      path: "/Users/boss/.gemini/antigravity/brain/30a1ca36-ea64-4595-9c81-16f6caf8ea14/register_preview.png",
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
      path: "/Users/boss/.gemini/antigravity/brain/30a1ca36-ea64-4595-9c81-16f6caf8ea14/api_keys_preview.png",
    });
  });
});
