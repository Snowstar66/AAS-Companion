import { expect, test } from "@playwright/test";

const routes = {
  blockedOutcome: "/outcomes/outcome_demo_governance_gap",
  blockedStory: "/stories/story_demo_outcome_workspace",
  handoffStory: "/handoff/story_demo_outcome_workspace"
} as const;

async function loginToDemoWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Enter demo workspace" }).click();
  await expect(page).toHaveURL(/workspace/);
}

test.describe.configure({ mode: "serial" });

test("M1 blocked path covers login, dashboard, blocked outcome, and blocked story readiness", async ({ page }) => {
  await loginToDemoWorkspace(page);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home Dashboard" })).toBeVisible();

  await page.goto(routes.blockedOutcome);
  await page.getByRole("button", { name: "Submit to Tollgate 1" }).click();
  await expect(page.getByText("Tollgate 1 is still blocked.")).toBeVisible();
  await expect(page.getByText("Baseline definition is missing.")).toBeVisible();

  await page.goto(routes.blockedStory);
  await page.getByRole("button", { name: "Record readiness" }).click();
  await expect(page.getByText("Story readiness is blocked.")).toBeVisible();
  await expect(page.getByText("Test Definition is required before handoff.")).toBeVisible();
});

test("M1 happy path covers outcome readiness, story readiness, and execution contract preview", async ({ page }) => {
  await loginToDemoWorkspace(page);

  await page.goto(routes.blockedOutcome);
  await page.getByLabel("Baseline definition").fill("Weekly governance review completion rate before and after the control plane rollout.");
  await page.getByLabel("Baseline source").fill("Manual leadership review spreadsheet, updated weekly.");
  await page.getByRole("button", { name: "Save outcome changes" }).click();
  await expect(page.getByText("Outcome changes were saved successfully.")).toBeVisible();
  await page.getByRole("button", { name: "Submit to Tollgate 1" }).click();
  await expect(page.getByText("Tollgate 1 submission recorded.")).toBeVisible();

  await page.goto(routes.blockedStory);
  await page.getByLabel("Test Definition").fill("Manual smoke plus regression verification for framing, outcome, and handoff states.");
  await page.getByRole("button", { name: "Save Story changes" }).click();
  await expect(page.getByText("Story changes were saved successfully.")).toBeVisible();
  await page.getByRole("button", { name: "Record readiness" }).click();
  await expect(page.getByText("Story readiness recorded.")).toBeVisible();

  await page.goto(routes.handoffStory);
  await expect(page.getByRole("heading", { name: "JSON preview" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy JSON" })).toBeVisible();
  await expect(page.getByText("Test Definition")).toBeVisible();
});
