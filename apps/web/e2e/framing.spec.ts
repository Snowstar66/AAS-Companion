import { expect, test } from "@playwright/test";

test("framing cockpit smoke", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await page.goto("/framing");

  await expect(page.getByRole("heading", { name: "Framing Cockpit" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start new case" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open demo case" }).first()).toBeVisible();
  await expect(page.getByText("No native cases yet")).toBeVisible();
});
