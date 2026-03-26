# Framing Handshake and AAS Help Patch Pack

Detta patch-pack gör två saker:

1. gör **Framing** till en tydlig kund-handshake inne i projektet
2. lägger till **inbyggd hjälp i verktyget** baserad primärt på AAS

Målet är att användaren tillsammans med kunden ska kunna:

* handskaka om vad man vill uppnå
* handskaka om ungefär vilken funktionell riktning som behövs
* handskaka om vilken AI Acceleration Level som är rimlig
* förstå vad som ska formuleras i respektive fält
* få hjälp direkt i verktyget utan att lämna arbetsflödet

Patch-packet utgår från modellen:

**Home → välj projekt → Framing som första arbetsyta i projektet → vidare till Design/Value Spine**

**Rekommenderad körordning:**

1. M1-PATCH-053 — Make Framing the customer handshake workspace inside project
2. M1-PATCH-054 — Add guided formulation prompts to Framing fields
3. M1-PATCH-055 — Add AAS-based tooltips and help overlays in core workspaces
4. M1-PATCH-056 — Make help context-sensitive by phase, object type and AI level
5. M1-PATCH-057 — Govern in-product help content from AAS source patterns

---

# M1-PATCH-053

## Title

Make Framing the customer handshake workspace inside project

## Story Type

UX / Workflow Patch

## Value Intent

Make Framing the clear place where team and customer agree what they want to achieve, the approximate functional direction and the intended AI acceleration level before moving into Design.

## Summary

Refine Framing so it acts as the first working section inside a project where customer and delivery team can jointly define business effect, baseline, ownership, high-level functional direction and intended AI level.

## Acceptance Criteria

* Framing is presented as the first working section inside a project
* Framing is understandable as a handshake workspace for customer and delivery team
* Framing supports definition of:

  * problem statement
  * desired outcome
  * baseline
  * value owner
  * high-level functional direction
  * intended AI acceleration level
* Framing helps user understand that detailed breakdown belongs later in Design
* Framing can capture Epic seeds or equivalent high-level design direction without requiring full Story decomposition
* Framing clearly shows next step toward Design when enough information exists
* Framing does not require full detailed implementation specification before progress can continue
* Framing remains scoped to the active project and current business case

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can use Framing to conduct a structured customer handshake
* Framing clearly captures outcome, direction and AI-level intention
* users understand that detailed Story/Test work belongs later
* Framing supports progression into Design without overloading the initial conversation
* Framing remains compatible with one active project / one active Framing model

## Scope In

* Framing workspace structure
* handshake-oriented information architecture
* progression cues from Framing to Design
* high-level functional direction support
* AI-level handshake support

## Scope Out

* detailed Story creation
* detailed Test authoring
* M3 approval redesign
* import parsing changes

## Constraints

* Framing must remain the business-case definition area of the project
* Framing must not collapse into full Design detail entry
* Framing must still support AAS-relevant decisions around outcome, baseline and AI level
* patch must remain compatible with later Value Spine authoring

## Required Evidence

* screenshot of handshake-oriented Framing workspace
* screenshot showing outcome, direction and AI-level sections
* short demo of moving from Framing handshake to Design

---

# M1-PATCH-054

## Title

Add guided formulation prompts to Framing fields

## Story Type

UX / Authoring Guidance Patch

## Value Intent

Help users formulate the right type of content in each Framing field so they can work faster and more consistently without guessing what each field is for.

## Summary

Add concise formulation prompts, helper copy and writing guidance to Framing fields so users understand what to write in problem, outcome, baseline, owner, direction and AI-level sections.

## Acceptance Criteria

* key Framing fields include short formulation guidance
* guidance is concise and practical rather than abstract
* guidance explains what kind of statement belongs in the field
* guidance helps users distinguish between:

  * business problem
  * desired outcome
  * baseline
  * high-level functional direction
  * AI level decision
* guidance is available without leaving the current flow
* guidance improves first-time use of Framing
* guidance does not overwhelm the form or dominate the UI
* guidance remains compatible with later tooltips and help overlays

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can understand what to formulate in key Framing fields
* field guidance reduces duplicate or misdirected text entry
* guidance remains lightweight and operationally useful
* Framing form becomes easier to use during customer discussions

## Scope In

* helper text in Framing form
* formulation prompts for key fields
* lightweight field-level guidance copy
* distinction between business and design-oriented wording

## Scope Out

* full help system for all sections
* advanced writing assistant behavior
* automated content generation
* import guidance

## Constraints

* guidance must remain concise and in-flow
* guidance must support AAS intent without becoming long documentation text
* field prompts must not encourage users to write detailed Design-level content in Framing
* patch must remain compatible with broader in-product help patterns

## Required Evidence

* screenshot of Framing field with guided prompt
* screenshot showing helper copy for at least outcome and AI level
* short demo of guided authoring in Framing

---

# M1-PATCH-055

## Title

Add AAS-based tooltips and help overlays in core workspaces

## Story Type

Help / UX Patch

## Value Intent

Give users immediate in-product guidance on what fields, sections and concepts mean, without forcing them to search externally for AAS interpretation.

## Summary

Introduce a lightweight in-product help system using tooltips, help icons and optional overlay cards so users can understand key concepts and field purposes across Framing, Value Spine, Import and Human Review.

## Acceptance Criteria

* core workspaces can show in-product help through lightweight help affordances
* supported affordances may include:

  * tooltip
  * help icon
  * overlay help card
* help can be accessed without leaving the current workspace
* help is available in at least:

  * Framing
  * Outcome or Value Spine authoring views
  * Import
  * Human Review
* help content explains field or section purpose in practical terms
* help content is brief enough for in-flow use
* help overlays do not block ordinary work unnecessarily
* users can dismiss help overlays easily
* help does not introduce a second confusing documentation layer outside the product flow

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration
* e2e smoke

## Definition of Done

* users can access contextual help where they work
* help improves understanding without forcing external lookup
* tooltips and overlays are usable and lightweight
* core workspaces become easier to understand for first-time users

## Scope In

* tooltip support
* help icon support
* overlay help-card support
* in-flow help for core sections
* dismiss and reopen behavior for help UI

## Scope Out

* full documentation portal
* chat-based assistant redesign
* long-form training content
* external knowledge search

## Constraints

* help must remain brief and contextual
* help must not overwhelm the UI or dominate editing space
* help must remain compatible with compact forms and list-based pages
* patch must keep users inside the working flow rather than sending them away

## Required Evidence

* screenshot of tooltip help
* screenshot of help icon opening overlay card
* screenshot of in-product help inside at least two core workspaces
* short demo of opening and dismissing contextual help

---

# M1-PATCH-056

## Title

Make help context-sensitive by phase, object type and AI level

## Story Type

Help / Context Patch

## Value Intent

Ensure users receive the right guidance for the current phase and object, rather than generic advice that blurs Framing, Design, Import and Governance concerns.

## Summary

Refine help behavior so the guidance shown depends on where the user is, what object they are editing and, where relevant, which AI acceleration level is active.

## Acceptance Criteria

* help content varies by workspace or section context where relevant
* Framing help emphasizes outcome, baseline, functional direction and AI-level handshake
* Epic help emphasizes value area and scope
* Story help emphasizes value intent, acceptance criteria, AI usage scope and testability
* Import help emphasizes source, interpretation, uncertainty and correction
* Human Review help emphasizes what must be corrected or confirmed before approval readiness
* where relevant, help reflects the active AI level context without duplicating unnecessary complexity
* help content remains concise even when context-sensitive
* context-sensitive help does not confuse users by mixing phase-specific concepts

## AI Usage Scope

* CODE
* TEST

## Test Definition

* component
* integration

## Definition of Done

* users receive more relevant guidance for the current context
* help reinforces the difference between Framing, Design, Import and Human Review
* AI-level-sensitive help remains understandable and useful
* context-specific help reduces the chance of entering the wrong type of content in the wrong place

## Scope In

* context-aware help selection
* object-type help variation
* phase-aware help variation
* AI-level-aware help variation where appropriate

## Scope Out

* adaptive personalization by user role history
* long-form training journeys
* automated writing suggestions beyond basic help
* M3-specific approval policy explanation redesign

## Constraints

* context-sensitive help must not become verbose or inconsistent
* help must reinforce, not blur, the product's simplified operating model
* AI-level-aware guidance must remain proportionate and understandable
* patch must remain compatible with tooltip and overlay patterns

## Required Evidence

* screenshot of Framing help card
* screenshot of Story help card
* screenshot of Import or Human Review help card
* example showing AI-level-aware help variation

---

# M1-PATCH-057

## Title

Govern in-product help content from AAS source patterns

## Story Type

Content Governance Patch

## Value Intent

Keep in-product help trustworthy and consistent by grounding it in approved AAS concepts and reusable guidance patterns rather than ad hoc copy.

## Summary

Define a governed content approach for in-product help so tooltips, helper text and help overlays are primarily based on AAS concepts and remain consistent across the tool.

## Acceptance Criteria

* in-product help content follows approved AAS-aligned patterns
* field help and section help use consistent tone and structure
* help content distinguishes between:

  * what this field or section is for
  * what kind of content belongs here
  * what does not belong here
* help content can be reused across similar fields where appropriate
* help content remains short enough for in-flow use
* changes to help content can be managed consistently rather than copied ad hoc into many places
* users can trust that help reflects the intended AAS way of working
* help content remains compatible with future UI simplification and translation work

## AI Usage Scope

* CODE
* TEST

## Test Definition

* review
* integration

## Definition of Done

* in-product help has a coherent source pattern and structure
* help content feels consistent across Framing, Value Spine, Import and Human Review
* AAS-aligned guidance is visible in the product without becoming heavy documentation
* help content can scale as the product grows

## Scope In

* help content pattern definition
* reusable help copy structure
* AAS-aligned guidance rules for in-product help
* consistency rules for helper text, tooltip and overlay content

## Scope Out

* full external documentation strategy
* legal/compliance content governance
* role training curriculum
* open-ended AI assistant content generation

## Constraints

* in-product help must remain primarily grounded in AAS concepts
* help must remain concise and operational, not academic
* content governance must not block normal UI iteration excessively
* patch must remain compatible with future patch packs for simplification and navigation clarity

## Required Evidence

* example help-content pattern
* screenshot showing consistent help structure across two or more sections
* before/after example of ad hoc help copy replaced with governed help copy
