import { expect, test, type Locator, type Page } from "@playwright/test";

async function loginToDemoWorkspace(page: Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: /Enter demo (workspace|project)/ }).click();
  await expect(page).not.toHaveURL(/login/);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectRenderedSvg(page: Page, accessibleName: string) {
  const svg = page.getByRole("img", { name: accessibleName });
  await expect(svg).toBeVisible();

  const box = await svg.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(240);
  expect(box?.height ?? 0).toBeGreaterThan(80);
}

async function expectInViewport(locator: Locator, viewportHeight: number) {
  await expect(locator).toBeVisible({ timeout: 10000 });
  const box = await locator.boundingBox();

  expect(box?.y ?? viewportHeight + 1).toBeLessThan(viewportHeight);
}

test("Control Mirror executive cockpit is clear on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await loginToDemoWorkspace(page);
  await page.goto("/control-mirror");

  await expect(page.getByRole("heading", { level: 1, name: "Control Mirror" })).toBeVisible();
  await expectInViewport(page.getByText("Source judged"), 1000);
  await expectInViewport(page.getByText("Control posture"), 1000);
  await expectInViewport(page.getByText("Human decisions"), 1000);
  await expectInViewport(page.getByText("Evidence gaps"), 1000);
  await expect(page.getByText("AI, lineage and Value Spine gaps treated as risk")).toBeVisible();

  await expectRenderedSvg(page, "Value Spine coverage diagram");
  await expect(page.getByText("Outside spine")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("Control Mirror executive cockpit remains usable on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginToDemoWorkspace(page);
  await page.goto("/control-mirror");

  await expect(page.getByRole("heading", { level: 1, name: "Control Mirror" })).toBeVisible();
  await expect(page.getByText("Source judged")).toBeVisible();
  await expect(page.getByText("Control posture")).toBeVisible();
  await expect(page.getByText("Human decisions")).toBeVisible();
  await expect(page.getByText("Evidence gaps")).toBeVisible();

  await page.getByText("Value Spine flow").scrollIntoViewIfNeeded();
  await expectRenderedSvg(page, "Value Spine coverage diagram");
  await expectNoHorizontalOverflow(page);
});
