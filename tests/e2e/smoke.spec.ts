import { expect, test } from "@playwright/test";

test.describe("critical paths", () => {
  test("landing page renders hero and primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    const cta = page.getByRole("link", { name: /get started free|免费开始使用/i });
    await expect(cta.first()).toBeVisible();
  });

  test("login page renders email + password fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });

  test("guest dashboard renders exactly one labeled Add Job entry point", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: /add job|添加职位/i })).toHaveCount(1);
  });

  test("topbar quick-add opens the enriched job dialog with tier selector", async ({
    page,
  }) => {
    await page.goto("/dashboard/pipeline");
    await page.getByRole("button", { name: /add job|添加职位/i }).first().click();
    await expect(page.locator("#add-job-title")).toBeVisible();
    await expect(page.getByText(/priority tier|优先级 tier/i)).toBeVisible();
  });

  test("discover page shows demo/live banner and scan button", async ({ page }) => {
    await page.goto("/dashboard/discover");
    await expect(
      page.getByText(/demo preview|演示模式|live mode|实时模式/i).first()
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /run (demo|live) scan|运行(模拟)?扫描/i })).toBeVisible();
  });

  test("reset-password page renders for anonymous visitors", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText(/invalid or expired|无效或已过期/i).first()).toBeVisible();
  });

  test("unknown routes serve the not-found page", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);
  });
});
