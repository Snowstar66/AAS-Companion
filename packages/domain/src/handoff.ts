import { z } from "zod";
import { aiAccelerationLevelSchema } from "./enums";

export const executionContractSchema = z.object({
  outcome_id: z.string().min(1),
  outcome_title: z.string().min(1),
  outcome_statement: z.string().nullish(),
  epic_id: z.string().min(1),
  epic_title: z.string().min(1),
  story_id: z.string().min(1),
  story_key: z.string().min(1),
  story_title: z.string().min(1),
  value_intent: z.string().min(1),
  expected_behavior: z.string().nullish(),
  ai_level: aiAccelerationLevelSchema,
  ai_usage_scope: z.array(z.string().min(1)).default([]),
  framing_version: z.number().int().positive().nullish(),
  acceptance_criteria: z.array(z.string().min(1)),
  test_definition: z.string().min(1),
  definition_of_done: z.array(z.string().min(1))
});

export type ExecutionContract = z.infer<typeof executionContractSchema>;

export function executionContractToMarkdown(contract: ExecutionContract) {
  const acceptanceCriteria = contract.acceptance_criteria.map((item) => `- ${item}`).join("\n");
  const definitionOfDone = contract.definition_of_done.map((item) => `- ${item}`).join("\n");

  return [
    "# Build Start Package",
    "",
    `- Outcome ID: ${contract.outcome_id}`,
    `- Outcome Title: ${contract.outcome_title}`,
    `- Outcome Statement: ${contract.outcome_statement ?? "Not captured"}`,
    `- Epic ID: ${contract.epic_id}`,
    `- Epic Title: ${contract.epic_title}`,
    `- Story ID: ${contract.story_id}`,
    `- Story Key: ${contract.story_key}`,
    `- Story Title: ${contract.story_title}`,
    `- Value Intent: ${contract.value_intent}`,
    `- Expected Behavior: ${contract.expected_behavior ?? "Not captured"}`,
    `- AI Level: ${contract.ai_level}`,
    `- AI Usage Scope: ${contract.ai_usage_scope.length ? contract.ai_usage_scope.join(", ") : "Not captured"}`,
    `- Framing Version: ${contract.framing_version ?? "Not captured"}`,
    "",
    "## Acceptance Criteria",
    acceptanceCriteria || "- None",
    "",
    "## Test Definition",
    contract.test_definition,
    "",
    "## Definition of Done",
    definitionOfDone || "- None"
  ].join("\n");
}
