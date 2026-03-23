import { z } from "zod";
import { aiAccelerationLevelSchema } from "./enums";

export const executionContractSchema = z.object({
  outcome_id: z.string().min(1),
  epic_id: z.string().min(1),
  story_id: z.string().min(1),
  story_key: z.string().min(1),
  ai_level: aiAccelerationLevelSchema,
  acceptance_criteria: z.array(z.string().min(1)),
  test_definition: z.string().min(1),
  definition_of_done: z.array(z.string().min(1))
});

export type ExecutionContract = z.infer<typeof executionContractSchema>;

export function executionContractToMarkdown(contract: ExecutionContract) {
  const acceptanceCriteria = contract.acceptance_criteria.map((item) => `- ${item}`).join("\n");
  const definitionOfDone = contract.definition_of_done.map((item) => `- ${item}`).join("\n");

  return [
    "# Execution Contract",
    "",
    `- Outcome ID: ${contract.outcome_id}`,
    `- Epic ID: ${contract.epic_id}`,
    `- Story ID: ${contract.story_id}`,
    `- Story Key: ${contract.story_key}`,
    `- AI Level: ${contract.ai_level}`,
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
