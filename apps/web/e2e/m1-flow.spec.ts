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

test("M1 clean case flow covers native creation, blocked TG1, and demo path access", async ({ page }) => {
  await loginToDemoWorkspace(page);

  await page.goto("/framing");
  await expect(page.getByRole("button", { name: "Start new case" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Open demo case" }).first()).toBeVisible();
  await expect(page.getByText("No native cases yet")).toBeVisible();

  await page.getByRole("button", { name: "Start new case" }).first().click();

  await expect(page).toHaveURL(/\/outcomes\//);
  await expect(page.getByText("Clean native case created and ready for framing work.")).toBeVisible();
  await expect(page.getByText("Case provenance")).toBeVisible();
  await expect(page.getByText("Active Framing context")).toBeVisible();
  await expect(page.getByText("Framing-scoped Value Spine")).toBeVisible();
  await expect(page.getByText("Origin: Native")).toBeVisible();
  await expect(page.getByText("Status: draft")).toBeVisible();
  await expect(page.getByText("No Epics exist for this case yet.")).toBeVisible();

  await page.getByRole("button", { name: "Submit to Tollgate 1" }).click();
  await expect(page.getByText("Tollgate 1 is still blocked.")).toBeVisible();
  await expect(page.getByText("Baseline definition is missing.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Epic" })).toBeVisible();

  await page.getByRole("button", { name: "Create Epic" }).click();
  await expect(page).toHaveURL(/\/epics\//);
  await expect(page.getByText("Native Epic created and ready for Story breakdown.")).toBeVisible();
  await expect(page.getByText("Active Framing context")).toBeVisible();
  await expect(page.getByText("No Stories exist for this Epic yet.")).toBeVisible();
  await page.getByRole("button", { name: "Create Story" }).click();

  await expect(page).toHaveURL(/\/stories\//);
  await expect(page.getByText("Native Story created and ready for design work.")).toBeVisible();
  await expect(page.getByText("Active Framing context")).toBeVisible();
  await expect(page.getByText("Story readiness is blocked.")).not.toBeVisible();
  await expect(page.getByText("Definition blocked")).toBeVisible();

  await page.goto("/framing");
  await expect(page.getByRole("button", { name: /Native \(\d+\)/ })).toBeVisible();
  await expect(page.getByText("New customer case")).toBeVisible();

  await page.getByRole("link", { name: "Open demo case" }).first().click();
  await expect(page).toHaveURL(/\/outcomes\//);
  await expect(page.getByText("Origin: Demo")).toBeVisible();
});
