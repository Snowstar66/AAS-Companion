# AAS Companion UX Specification

Version: 1.0
Source: Current AAS Companion web app
Purpose: Use this specification to create a similar governance/workspace app with the same visual language, information architecture, and interaction patterns.

## 1. Product Feel

AAS Companion should feel like a calm control plane for serious AI-enabled delivery work. It is not a marketing site and not a playful SaaS dashboard. The experience should communicate:

- Governed, traceable, structured work.
- Human decision ownership.
- Clear project scope.
- Progression from Framing to Design, Value Spine, Import, Review, Governance, and Handoff.
- Confidence without visual heaviness.

The UI language is quiet, light, structured, and operational. It uses soft glass-like surfaces, restrained blue-gray accents, strong whitespace, clear cards, and small status badges. Important decisions are close to the work, not hidden in settings.

## 2. Visual Identity

### Brand

- Product name: AAS Companion.
- Brand context: Structured AI delivery / governed AI delivery.
- Use a small square logo mark in a white framed container.
- Brand mark appears in the topbar and can appear in onboarding or sign-in states.

### Tone

- Professional, calm, and explanatory.
- Avoid hype language.
- Prefer "ready", "blocked", "needs review", "source of truth", "human mandate", "lineage", and "tollgate" vocabulary.
- Swedish and English UI copy should be supported.

## 3. Core Layout

### App Shell

The app uses a persistent three-zone control-plane shell:

- Left sidebar: persistent navigation and current project context.
- Main column: topbar plus current workspace surface.
- Optional right rail: contextual guidance and platform reminders.

Desktop layout:

- Outer page padding: 20px on desktop, 12px on small screens.
- Max width: 1920px.
- Grid columns:
  - Sidebar: 248px.
  - Main: flexible.
  - Right rail: 292px when present.
- Gap between columns: 20px.
- Sidebar and right rail become sticky on wide screens.

Mobile/tablet:

- Single column.
- Sidebar appears above main content.
- Right rail moves below main content.
- Keep all cards full-width and readable.

### Main Surface

The main content lives inside a large rounded panel:

- Radius: 28px.
- Border: soft blue-gray border.
- Background: translucent near-white.
- Shadow: large, diffuse, low-opacity.
- Padding: 20px mobile, 24px tablet, 28px desktop.

Suggested Tailwind shape:

```tsx
<main className="flex-1 rounded-[28px] border border-border/70 bg-background/85 p-5 shadow-[0_18px_65px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6 xl:p-7">
  {children}
</main>
```

## 4. Design Tokens

### Font

- Primary font: Manrope.
- Fallback: system sans-serif.
- Use the same font across the app.

### Color Tokens

Use OKLCH or equivalent values:

```css
:root {
  --background: oklch(0.985 0.004 255);
  --foreground: oklch(0.223 0.029 262);
  --card: oklch(0.995 0.002 255);
  --card-foreground: oklch(0.223 0.029 262);
  --popover: oklch(0.995 0.002 255);
  --popover-foreground: oklch(0.223 0.029 262);
  --primary: oklch(0.49 0.09 250);
  --primary-foreground: oklch(0.985 0.004 255);
  --secondary: oklch(0.95 0.013 251);
  --secondary-foreground: oklch(0.33 0.033 259);
  --muted: oklch(0.958 0.007 248);
  --muted-foreground: oklch(0.49 0.03 258);
  --accent: oklch(0.91 0.025 207);
  --accent-foreground: oklch(0.29 0.028 256);
  --border: oklch(0.89 0.01 250);
  --input: oklch(0.89 0.01 250);
  --ring: oklch(0.63 0.06 251);
  --radius: 1rem;
}
```

### Background

The global page background is a pale blue-gray canvas with subtle light:

```css
html {
  background:
    radial-gradient(circle at top left, rgba(83, 125, 176, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(243, 246, 252, 1), rgba(250, 251, 253, 1));
}
```

### Status Colors

Use semantic status colors sparingly:

- Ready / approved: emerald border and pale emerald background.
- Blocked / warning / needs action: amber border and pale amber background.
- Informational / active framing: sky border and pale sky background.
- Demo/imported metadata: violet or slate badges.
- Destructive or failure: red border and pale red background.

## 5. Typography

### Headings

- Page hero H1: 40-48px, semibold, tight tracking.
- Workspace H2: 28px desktop, 20px mobile.
- Card title: 18px, semibold.
- Compact panel title: 14-16px, semibold.

### Labels

Use uppercase labels for metadata and section headers:

- Font size: 11-12px.
- Weight: 600.
- Letter spacing: 0.14em to 0.24em.
- Color: muted foreground.

### Body Text

- Standard body: 14px.
- Important explanatory text: 16px with 28px line-height.
- Muted helper copy: muted foreground with 24px line-height.

## 6. Component System

### Cards

Default card:

- Radius: 24px or 28px.
- Border: `border-border/70`.
- Background: `bg-card` or near-white gradient.
- Shadow: small for ordinary cards, larger for hero cards.

Base:

```tsx
<Card className="rounded-3xl border bg-card text-card-foreground" />
```

Use cards for:

- Work objects.
- Guidance blocks.
- Summary panels.
- Import/review candidates.
- Repeated project/case rows.

Avoid cards inside cards unless the inner card is a small repeated object, status tile, or guidance box.

### Buttons

All major buttons are rounded pills:

- Radius: full.
- Height: 44px default.
- Gap between icon and label: 8px.
- Primary: blue primary background, white text.
- Secondary: white background, slate border, subtle shadow.
- Ghost: no border, muted hover background.

Button variants:

```tsx
default: "bg-primary px-4 py-2.5 text-primary-foreground shadow-sm hover:brightness-105"
secondary: "border border-slate-300/90 bg-white px-4 py-2.5 text-foreground shadow-sm hover:border-slate-400 hover:bg-slate-50"
ghost: "px-4 py-2.5 text-foreground hover:bg-muted"
```

Use lucide icons in action buttons when possible:

- ArrowRight for open/continue.
- FileSearch for lineage/origin.
- CircleHelp for help.
- Shield for governance.
- Search for search inputs.
- AlertTriangle for blockers.
- CheckCircle2 or CircleCheckBig for ready/complete.

### Badges / Chips

Badges are small rounded pills:

- Radius: full.
- Padding: 12px horizontal, 4px vertical.
- Font: 11-12px, medium or semibold.
- Use border plus pale background.

Common badge types:

- Object key: white or background with muted border.
- Readiness: amber/emerald/sky.
- Status: muted.
- Origin: Native, Demo, Imported.
- Import readiness: sky/slate.

### Forms

Inputs:

- Background: almost white.
- Border: soft border.
- Radius: 16px or 20px.
- Height: 44px or larger for search.
- Disabled fields use muted background.

Search field pattern:

```tsx
<label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
  <Search className="h-4 w-4 text-muted-foreground" />
  <input className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
</label>
```

### Help / Guidance

Guidance uses collapsible `details` panels:

- Radius: 16px.
- Border: soft.
- Background: translucent background.
- Summary row includes circle help icon, title, summary label, and chevron.
- Content includes three small boxes:
  - What this is for.
  - What belongs here.
  - What to avoid.

Inline guidance:

- Left accent border.
- Pale blue background.
- Small uppercase "Keep in mind" label.

Guidance visibility can be globally toggled from the sidebar.

## 7. Navigation

### Sidebar

The sidebar is the strongest visual anchor:

- Width: 248px.
- Background: dark navy `#102033`.
- Radius: 28px.
- Text: slate-50 and slate-300.
- Shadow: stronger than main cards.
- Padding: 16px horizontal, 20px vertical.

Sidebar structure:

1. Product title and short intro.
2. Current location card.
3. Main navigation.
4. Admin link separated at bottom.
5. Language toggle and guidance toggle.

Navigation items:

- Home: Open, resume, or create projects.
- Framing: Business case, baseline, owner, and direction.
- Pricing: Commercial fit, readiness, risks, and model advice.
- Value Spine: Framing, Epics, Stories, and readiness in one spine.
- Import: Upload and parse external source artifacts.
- Human Review: Review, correct, confirm, and approve imports.
- Governance: Roles, AI level, risks, and sign-off traceability.
- Help: Method guide, process flow, and key concepts.
- Admin: Bulk cleanup and hard deletion of test projects.

Active navigation item:

- White background.
- Dark text.
- Primary-colored icon.
- Subtle border and shadow.

Inactive item:

- White at 5% opacity.
- Hover to white at 10% opacity.

### Topbar

Topbar is a white, rounded context header:

- Radius: 28px.
- Border: soft.
- Background: white-to-off-white vertical gradient.
- Contains brand mark, "AI governance workspace" badge, breadcrumb-like location, page title, and session status.

Topbar title should reflect project section, not marketing copy.

## 8. Page Patterns

### Home / Project Dashboard

Purpose:

- Let the user open, resume, or create projects.
- Show project phase and readiness.
- Keep actions project-scoped.

Pattern:

- Summary cards at top.
- Project list below.
- Each project row should show phase, readiness, latest activity, and next action.

### Framing Cockpit

Purpose:

- Primary customer-handshake workspace.
- Helps user choose active Framing case and understand readiness.

Hero:

- Large rounded gradient hero card.
- Badge: "Customer handshake inside project".
- H1: "Framing Cockpit".
- Explanatory message.
- Summary chips for visible outcomes, blocked count, ready count.
- Two small explanatory panels:
  - Handshake in this project.
  - What comes later.

Secondary area:

- Active framing card in pale sky.
- Demo card, if demo data exists.
- Context help panel.

Filters:

- Search input.
- Origin segmented pills: All, Native, Demo.
- Readiness segmented pills: All readiness, Blocked, Ready.

Outcome cards:

- Key badge, readiness badge, status badge, origin badge.
- Large title.
- Readiness detail.
- Primary action: Open Framing.
- Secondary action: Open Import Lineage if available.
- Metadata tiles: Owner, Baseline, Linked work, Updated.
- Blockers appear in amber panel.
- Ready status appears in emerald panel.

### Value Spine

Purpose:

- Show the traceable hierarchy from Outcome to Epic to Story Ideas and Delivery Stories.

Hierarchy:

- Outcome row with Target icon.
- Epic rows with GitBranch icon.
- Story Idea rows with Lightbulb icon.
- Delivery evidence rows with evidence/status styling.

Story Ideas:

- Should be explicitly labeled "Story idea".
- Capture value intent and expected behavior.
- Show "Framing-ready" when value intent and expected behavior are present.
- Show amber "Needs action" if required framing inputs are missing.
- Keep returned delivery evidence secondary and traceability-focused.

### Import

Purpose:

- Upload external text, markdown, JSON, or CSV artifacts.
- Parse them into candidate AAS objects.
- Preserve source lineage and review status.

Pattern:

- Upload or session list.
- File cards show classification, parsed sections, uncertainty, unresolved work.
- Candidate cards show type, source, mapping state, relationship state, and review status.
- Use Human Review for confirm/correct/reject/promote actions.

### Human Review

Purpose:

- Govern imported candidates.
- Make human decisions visible.
- Prevent silent promotion of uncertain or blocked objects.

Pattern:

- Candidate queue.
- Findings grouped by missing, uncertain, human-only, blocked, unmapped.
- Draft record editor.
- Human decision fields.
- Promote only when readiness permits.

### Governance

Purpose:

- Show roles, AI level, risks, sign-off and traceability.
- Governance should stay near the work rather than hidden in admin.

Pattern:

- Role cards.
- AI level and mandate panels.
- Risk posture cards.
- Sign-off / tollgate state.
- Use shield iconography.

## 9. Interaction Principles

- Always preserve source of truth and lineage.
- Never make automatic approvals feel equivalent to human approval.
- Prefer visible readiness states over hidden validation.
- Every aggregate number should drill into the underlying objects.
- Keep demo data visibly separate from native work.
- Imported data can coexist with native data but should retain import lineage.
- Avoid destructive actions unless clearly separated and confirmed.
- Show blockers where the user is working.
- Use guidance panels for method help, not long in-app documentation.
- Keep one active project context at a time.

## 10. Responsive Rules

- Sidebar stacks above content below desktop width.
- Main panel remains rounded and padded.
- Cards become single-column on small screens.
- Buttons wrap instead of shrinking text.
- Badge groups wrap.
- Filter chips allow horizontal scrolling when needed.
- Long titles wrap; metadata labels can truncate.
- Do not rely on color alone for warning/ready states; include icons or text.

## 11. Implementation Stack

Recommended stack for closest match:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn-style primitives.
- lucide-react icons.
- Manrope via `next/font/google`.

Required assets:

- AAS logo image or replacement logo in a framed square.
- Optional flag icons for English/Swedish toggle.

## 12. Minimal CSS Foundation

Use the token block from section 4 plus:

```css
body {
  min-height: 100vh;
  background: transparent;
  color: var(--foreground);
  font-family: var(--font-sans), sans-serif;
}

input:not([type="checkbox"]):not([type="radio"]),
textarea,
select {
  background-color: rgba(255, 255, 255, 0.98) !important;
}

::selection {
  background: rgba(83, 125, 176, 0.2);
}
```

## 13. Build Checklist

- App shell has dark sidebar, white topbar, rounded main panel, optional right rail.
- Manrope is loaded globally.
- Primary color is muted blue, not saturated purple or bright SaaS blue.
- Cards use 24-28px radius and soft borders.
- Buttons are rounded pills.
- Status colors are semantic and restrained.
- Framing is presented as customer handshake, not delivery planning.
- Story Ideas are distinct from Delivery Stories.
- Import and review always show source lineage.
- Governance is visible in work views.
- Demo and native work are visually distinct.
- Mobile layouts stack cleanly without text overflow.
