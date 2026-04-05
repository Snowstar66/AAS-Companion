# AAS Tollgate 1 – Interactive Framing & Decision Engine

## 🧭 Purpose
Build an interactive UI + guided dialogue that enforces AAS Framing and produces a **Tollgate 1 decision**.

The system must:
- Ask explicit questions (not just fields)
- Use follow-up questions dynamically
- Challenge weak input
- Enforce STOP conditions
- Adapt based on AD / AT / AM

---

# 🔷 SECTION 1 – Initiative Classification

## Question
"Vilken typ av initiativ gäller detta?"

Options:
- AD – Nyutveckling (värdehypotes)
- AT – Transformation (problembevis)
- AM – Förvaltning (optimering)

## System Logic
- IF AD → activate AD logic
- IF AT → activate AT logic (strict mode)
- IF AM → activate AM logic (data-driven)

---

# 🔷 SECTION 2 – Outcome (CRITICAL)

## Primary Question
"Vilken konkret affärseffekt vill ni uppnå?"

## Follow-up Questions
- "Hur mäts detta idag?"
- "Vad är nuvarande nivå (baseline)?"
- "Vad är målbilden?"
- "Inom vilken tidsram?"

## Challenge Questions
- "Vad händer om ni inte gör detta?"
- "Hur vet ni att detta är rätt problem att lösa?"

## UI Fields
- Outcome statement (text)
- Baseline (number/text)
- Target (number/text)
- Timeframe
- Value Owner

---

## Validation

### STOP
- Outcome saknas
- Value Owner saknas

### STOP (AT / AM)
- Baseline saknas

### WARNING
- Outcome ej mätbart
- Otydlig effekt

---

# 🔷 SECTION 3 – Problem / Need

## AD Mode (hypothesis)
Primary Question:
"Vilket problem tror ni att detta löser?"

Follow-up:
- "Hur påverkar detta användare eller verksamhet?"
- "Vilken evidens finns (om någon)?"

Challenge:
- "Är detta ett problem eller en lösning i förklädnad?"

---

## AT Mode (proof required)
Primary Question:
"Vilket konkret problem finns i dagens system?"

Follow-up:
- "Hur påverkar detta lead time, kostnad eller risk?"
- "Hur ofta uppstår problemet?"

Challenge:
- "Vad kostar detta problem idag?"
- "Vad är rotorsaken?"

---

## AM Mode (data-driven)
Primary Question:
"Vilka operativa problem ser ni i drift?"

Follow-up:
- "Vilka mönster ser ni i incidenter?"
- "Vad är mest frekvent eller dyrt?"

Challenge:
- "Vilka problem är återkommande?"
- "Vad kan automatiseras?"

---

## Validation

### STOP (AT / AM)
- Problem ej kvantifierat

### WARNING
- Vaga formuleringar
- Lösningsfokus istället för problem

---

# 🔷 SECTION 4 – Baseline & Data

## AT Mode (REQUIRED)

Questions:
- "Vad är nuvarande change lead time?"
- "Hur stor del av budget går till maintenance?"
- "Hur många incidenter per månad?"
- "Hur komplexa beroenden finns?"

### STOP
- Någon av ovan saknas

---

## AM Mode (REQUIRED)

Questions:
- "Hur många incidenter per månad?"
- "Vad är MTTR?"
- "Hur ser SLA-uppfyllnad ut?"
- "Vad kostar ett ärende?"

### STOP
- Mindre än 2 datapunkter

---

## AD Mode (OPTIONAL)

Questions:
- "Finns någon baseline idag?"
- "Hur mäts nuvarande arbetssätt?"

---

# 🔷 SECTION 5 – Scope & MVP

## Primary Question
"Vad ingår i första leveransen?"

## Follow-up
- "Vad ingår INTE?"
- "Vad är minsta möjliga värde (MVP)?"

## Challenge
- "Är detta genomförbart inom rimlig tid?"
- "Vad kan tas bort utan att tappa värde?"

---

## Validation
- WARNING om scope otydlig
- WARNING om MVP saknas (AD)

---

# 🔷 SECTION 6 – Epics (Value Spine Start)

## Question
"Vilka huvudområden (Epics) bryter ner detta Outcome?"

## Follow-up
- "Hur kopplar varje Epic till Outcome?"
- "Vilket värde levererar varje Epic?"

## UI
Repeatable Epic list:
- Name
- Description
- Outcome link (checkbox)

---

## Validation
- STOP om inga Epics
- WARNING om ingen koppling till Outcome

---

# 🔷 SECTION 7 – Risk Profile

## Questions
- "Vilka risker finns?"
- "Vad händer om detta går fel?"
- "Vilka delar påverkar produktion?"

## Follow-up
- "Hur stor är påverkan?"
- "Kan risk begränsas?"

## UI
- Risk types
- Impact level
- Risk acceptance checkbox

---

## Validation
- STOP om risk ej accepterad

---

# 🔷 SECTION 8 – AI Acceleration Level

## Primary Question
"Hur vill ni använda AI i detta initiativ?"

## Follow-up
- "Vad ska AI göra konkret?"
- "Vilken nivå av automation är acceptabel?"

## Challenge
- "Är governance tillräcklig för denna nivå?"
- "Vad händer vid felaktig AI-output?"

---

## UI
- Level 0–3
- AI usage scope
- Justification

---

## Validation

### STOP
- Level 3 + saknar:
  - baseline (AT)
  - governance

### WARNING
- AI-nivå > mognad

---

# 🔷 SECTION 9 – Governance

## Questions
- "Vem äger affärsvärdet?" (Value Owner)
- "Finns arkitektansvar?" (AT required)
- "Vem accepterar risk?"

---

## Validation

### STOP
- Ingen Value Owner
- AT utan arkitekt
- Level 2–3 utan riskägare

---

# 🔷 SECTION 10 – Decision Engine

## Logic

### NO GO if:
- Outcome saknas
- Baseline saknas (AT/AM)
- Ingen Value Owner
- Problem ej kvantifierat (AT/AM)
- Inga Epics

---

### CONDITIONAL GO if:
- Scope otydlig
- Data ofullständig
- Risk ej fullt analyserad

---

### GO if:
- Allt ovan uppfyllt
- Risk accepterad
- AI-nivå rimlig

---

# 🔷 OUTPUT

## Summary
- Type (AD/AT/AM)
- Outcome
- Risk level
- AI Level

## Decision
- GO / CONDITIONAL / NO GO

## Rationale
- Outcome
- Baseline
- Problem
- Risk
- AI Level

## Required Actions
- Lista av gap att åtgärda

---

# 🔒 CORE AAS RULES

- AD utan Outcome → STOP
- AT utan baseline → STOP
- AM utan data → STOP
- AI-nivå får inte överstiga governance
- Human måste acceptera risk

---

# 🎯 SYSTEM BEHAVIOR

- Ställ frågor en i taget (konversation)
- Visa UI parallellt
- Blockera vid STOP
- Visa varningar inline
- Utmana svaga svar
- Föreslå förbättringar