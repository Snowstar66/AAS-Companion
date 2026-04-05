# AAS Tollgate 1 – Framing & Commit to Design

## 🧭 Purpose
Build a dynamic UI form that guides a user through AAS Framing and produces a **Tollgate 1 decision (GO / CONDITIONAL / NO GO)**.

The UI must:
- Adapt based on selected type: AD / AT / AM
- Enforce AAS governance rules
- Include validation, warnings and stop conditions
- Output structured decision support

---

# 🔷 SECTION 1 – Initiative Classification (MANDATORY)

## Field: Initiative Type
- Type: Dropdown (single select)
- Options:
  - AD – Application Development
  - AT – Application Transformation
  - AM – Application Management

## Field: Initiative Description
- Type: Text area
- Required: Yes

## System Behavior
- Based on selection:
  - AD → Show AD sections
  - AT → Show AT sections
  - AM → Show AM sections

---

# 🔷 SECTION 2 – Outcome Definition (ALL TYPES)

## Field: Outcome Statement
- Type: Text
- Required: Yes

## Field: Metric Type
- Type: Dropdown
- Options:
  - Cost
  - Time
  - Quality
  - Volume
  - Other

## Field: Baseline Value
- Type: Number/Text
- Required:
  - AD: Optional
  - AT: REQUIRED
  - AM: REQUIRED

## Field: Target Value
- Type: Number/Text
- Required: Yes

## Field: Timeframe
- Type: Text (e.g. "6 months")
- Required: Yes

## Field: Value Owner
- Type: Text
- Required: Yes

---

## Validation Rules

### STOP CONDITIONS
- If Outcome is empty → BLOCK submission
- If AT or AM and Baseline is empty → BLOCK submission

### WARNING
- If AD and Baseline empty → Warning: "Baseline recommended for measurement"

---

# 🔷 SECTION 3 – Problem / Need Definition

## Field: Problem Description
- Type: Text area
- Required: Yes

## Field: Quantified Impact
- Type: Text / Number
- Required:
  - AD: Optional
  - AT: REQUIRED
  - AM: REQUIRED

---

## Validation Rules

### STOP CONDITIONS
- AT: If no quantified impact → BLOCK
- AM: If no operational data → BLOCK

### WARNING
- AD: If only vague statements → "Problem is not measurable"

---

# 🔷 SECTION 4 – Scope Definition

## Field: Included Scope
- Type: Text area
- Required: Yes

## Field: Excluded Scope
- Type: Text area
- Required: Yes

---

## Validation Rules
- If scope unclear → Warning: "Scope not bounded"

---

# 🔷 SECTION 5 – Epics (Value Spine Initialization)

## Field: Epics List
- Type: Repeatable list
- Required: Minimum 1

Each Epic must include:
- Name
- Description
- Link to Outcome (checkbox confirmation)

---

## Validation Rules
- If no Epics → BLOCK
- If Epics not linked to Outcome → WARNING

---

# 🔷 SECTION 6 – Risk Profile

## Field: Risk Types
- Multi-select:
  - Delivery risk
  - Architecture risk
  - Data/Security risk
  - Operational risk
  - Business risk

## Field: Risk Description
- Type: Text area

## Field: Risk Impact Level
- Dropdown:
  - Low
  - Medium
  - High

## Field: Risk Accepted
- Checkbox (must be confirmed)

---

## Validation Rules
- If risk not acknowledged → BLOCK

---

# 🔷 SECTION 7 – AI Acceleration Level

## Field: AI Level
- Dropdown:
  - Level 0
  - Level 1
  - Level 2
  - Level 3

## Field: AI Usage Scope
- Multi-select:
  - Content
  - Code
  - Test
  - Design
  - Ops
  - Agentic

## Field: Justification
- Text area

---

## Validation Rules

### HARD RULE
- If AI Level > allowed by risk → FORCE WARNING

### AT RULE
- If Level 3 AND missing:
  - baseline
  - governance
→ BLOCK

### GENERAL RULE
- If governance capability not described → WARNING

---

# 🔷 SECTION 8 – Governance & Roles

## Field: Value Owner Exists
- Yes/No

## Field: Architect Identified (REQUIRED for AT)
- Yes/No

## Field: Risk Owner Identified (REQUIRED for Level 2–3)
- Yes/No

---

## Validation Rules

### STOP CONDITIONS
- No Value Owner → BLOCK
- AT without Architect → BLOCK
- Level 2–3 without Risk Owner → BLOCK

---

# 🔷 SECTION 9 – TYPE-SPECIFIC LOGIC

---

## 🟢 IF AD SELECTED

Show additional guidance:
- Focus on value hypothesis
- MVP must be defined

### Warning
- "No Outcome = feature factory risk"

---

## 🔴 IF AT SELECTED

Show additional fields:

### Field: Current System Metrics
- Lead time
- Maintenance cost
- Incident level
- Dependency complexity

(All REQUIRED)

### STOP CONDITIONS
- Any missing → BLOCK

### Warning
- "Transformation without baseline is invalid"

---

## 🔵 IF AM SELECTED

Show additional fields:

### Field: Operational Metrics
- Incident volume
- MTTR
- SLA compliance
- Cost per ticket

(At least 2 required)

### STOP CONDITIONS
- No data → BLOCK

---

# 🔷 SECTION 10 – Decision Engine (AUTO-GENERATED)

## Logic:

### NO GO if:
- Missing Outcome
- Missing baseline (AT/AM)
- No Value Owner
- No Epics
- No quantified problem (AT/AM)

---

### CONDITIONAL GO if:
- Minor gaps:
  - weak scope
  - incomplete data
  - unclear risks

---

### GO if:
- All required fields valid
- Risk accepted
- AI level aligned with governance

---

## Output Fields

### Decision
- GO / CONDITIONAL / NO GO

### Decision Rationale
- Per dimension:
  - Outcome
  - Baseline
  - Risk
  - AI Level
  - Governance

### Required Actions (if Conditional)
- List auto-generated gaps

---

# 🔷 FINAL OUTPUT FORMAT

Display summary:

## Summary
- Initiative type
- Outcome
- AI Level
- Risk level

## Decision
- GO / CONDITIONAL / NO GO

## Key Issues
- Bullet list

## Required Actions
- Bullet list

---

# 🔒 CRITICAL AAS RULES (MUST BE ENFORCED)

- No Outcome → STOP
- No baseline (AT/AM) → STOP
- No Value Owner → STOP
- AI Level must not exceed governance capability
- Human must accept risk

---

# 🧠 SYSTEM BEHAVIOR

- Do NOT allow submission if STOP conditions met
- Show warnings inline
- Highlight missing required fields
- Provide recommendations dynamically

---

# 🎯 GOAL

The UI must behave as an **AAS governance gate**, not a passive form.

It should actively:
- challenge weak framing
- block invalid transformation
- guide toward correct AI level
- enforce Value Spine thinking