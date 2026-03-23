import { expect, test } from "@playwright/test";

async function loginToDemoWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(page).toHaveURL(/workspace/);
}

test("M2 artifact intake smoke covers upload, classification, and reviewable candidates", async ({ page }) => {
  await loginToDemoWorkspace(page);

  await page.goto("/intake");
  await expect(page.getByRole("heading", { name: "Artifact Intake workspace" })).toBeVisible();

  await page.setInputFiles('input[name="files"]', [
    {
      name: "artifact-session.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Imported artifact\n\n## Story\n\n- Acceptance criteria\n")
    }
  ]);

  await page.getByRole("button", { name: "Create intake session" }).click();

  await expect(page.getByText(/Uploaded 1 markdown file/)).toBeVisible();
  await expect(page.getByText("artifact-session.md")).toBeVisible();
  await expect(page.getByText(/story file|mixed markdown bundle|unknown artifact/i)).toBeVisible();
  await expect(page.getByText(/human review required/i)).toBeVisible();
});
