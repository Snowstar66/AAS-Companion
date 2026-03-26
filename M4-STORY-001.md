# M4-STORY-001

## Title
Add Pricing page as project section

## Story Type
Feature

## Value Intent
Allow users to evaluate suitable pricing models based on current project framing without disrupting design workflow.

## Summary
Introduce a Pricing (Commercial Fit) page as a new section in project navigation. The page is read-only initially and uses Framing data to evaluate commercial model fit.

## Acceptance Criteria
- Pricing page exists as a project section
- Pricing page is accessible from project navigation
- Pricing page is scoped to active project only
- Pricing page loads without requiring completed Framing
- Pricing page does not modify Framing, Epic, Story or Test data
- Pricing page follows same UI layout and styling as other sections

## AI Usage Scope
- CODE
- TEST

## Test Definition
- component
- integration
- e2e smoke

## Definition of Done
- page renders within project context
- navigation is consistent with other sections
- no cross-project data appears