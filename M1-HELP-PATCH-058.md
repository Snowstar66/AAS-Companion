# M1-PATCH-058

## Title

Add AAS-based intro help page accessible from global navigation

## Story Type

UX / Help Patch

## Value Intent

Help users quickly understand what the tool is, how it fits into AI development, and how to use it without requiring external documentation or long onboarding.

## Summary

Introduce a lightweight intro/help page based on AAS and the purpose of the tool. The page should be accessible via a persistent help icon or menu entry and provide a concise explanation of the workflow: Framing → Design → Build (AI tools), along with what the tool does and does not do.

---

## Acceptance Criteria

### Access & Navigation

* a Help icon or menu item is visible in global navigation
* help page can be opened from anywhere in the tool
* help page opens in overlay or dedicated page without losing current context
* user can close help easily and return to work

### Content Structure

Help page contains the following sections:

#### 1. What is this tool?

* short explanation (max ~5 lines)
* explains that the tool helps define and structure work before AI build

#### 2. How it works

* simple 3-step flow:

  * Framing → define outcome and direction
  * Design → break down into Epic/Story/Test
  * Build → use AI tools (Codex/BMAD)

#### 3. When to use it

* examples:

  * new feature
  * unclear requirements
  * AI-heavy development

#### 4. What this tool does NOT do

* does not generate code
* does not replace developers
* does not auto-approve decisions

### UX Behavior

* content is readable in under 1–2 minutes
* no long scrolling documentation
* no external links required for basic understanding
* language is simple and practical (not theoretical AAS language)

### AAS Alignment

* explanation reflects AAS structure without heavy terminology
* emphasizes:

  * outcome-first thinking
  * test-before-build
  * AI as controlled acceleration
  * human mandate

---

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

---

## Definition of Done

* users can access help from anywhere
* users can understand tool purpose in under 2 minutes
* help content improves onboarding without external docs
* help does not interrupt workflow
* content aligns with AAS principles

---

## Scope In

* help icon or menu entry
* help page or overlay
* structured intro content
* lightweight navigation and close behavior

## Scope Out

* full documentation system
* contextual help per field (future)
* tutorial walkthroughs
* video or interactive onboarding

---

## Constraints

* help must remain concise and practical
* help must not become long-form documentation
* help must be consistent with AAS but not overly technical
* help must not block user workflow

---

## Required Evidence

* screenshot of help icon in navigation
* screenshot of intro help page
* demo of opening and closing help from any workspace
* example showing content readability within 1–2 minutes

---

## Suggested UI Placement

* top right help icon (preferred)
* or global menu item labeled "Help" or "What is this?"

---

## Exact Help Page Copy (Ready to Implement)

### Title

**What is this tool?**

---

### Section 1 — What this tool does

This tool helps you **define, structure and validate what to build before using AI**.

Instead of starting with prompts, you:

* agree on the outcome
* structure the work
* define how it will be tested
* decide how much AI to use

---

### Section 2 — How it fits into AI development

```
Framing → Design → Build (AI tools)
```

* **Framing**: agree what to achieve and why
* **Design**: break work into testable pieces
* **Build**: use AI tools like Codex or BMAD

**This tool focuses on Framing and Design.**

---

### Section 3 — What happens in each step

#### Framing (you + customer)

* define the problem
* define the outcome
* set baseline and success
* decide AI level
* outline high-level direction

👉 Result: clear intent

---

#### Design (team)

* create Epics
* create Stories
* define acceptance criteria
* define tests before build
* define AI usage scope

👉 Result: build-ready input

---

#### Build (AI tools)

* Codex / BMAD generate code
* tests are executed
* iteration happens

👉 This tool does **not** build the code

---

### Section 4 — When to use this tool

Use this tool when:

* you start a new feature
* requirements are unclear
* AI will be used heavily
* you need control and traceability

---

### Section 5 — What this tool does NOT do

* does not generate code
* does not replace developers
* does not auto-approve decisions
* does not replace agile methods

---

### Section 6 — Key principles

* Outcome before output
* Test before build
* AI is controlled acceleration
* Human remains responsible

---

## Suggested Visual Diagrams (for Codex implementation)

### Diagram 1 — Simple flow

```
Customer → Framing → Design → AI Build
```

### Diagram 2 — Value Spine

```
Outcome
  → Epic
    → Story
      → Test
```

### Diagram 3 — Responsibility split

```
You → decide what and how
AI → builds it
```

---

## Future Extension (not in scope now)

* contextual help per page (Framing, Story, Import, Governance)
* inline tooltips tied to AAS concepts
* guided onboarding for first-time users
