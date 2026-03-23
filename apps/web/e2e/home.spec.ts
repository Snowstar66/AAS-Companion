import { expect, test } from "@playwright/test";

test("home dashboard smoke", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Home Dashboard" })).toBeVisible();
  await expect(page.getByText("M1-STORY-004 delivers the Home dashboard only.")).toBeVisible();
});
