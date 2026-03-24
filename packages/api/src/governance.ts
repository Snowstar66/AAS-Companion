import {
  createAgentRegistryEntry,
  createPartyRoleEntry,
  getOutcomeById,
  getStoryById,
  listAgentRegistryEntries,
  listGovernanceRiskCombinationRules,
  listGovernanceRoleRequirements,
  listPartyRoleEntries,
  listSignoffRecordsForOrganization,
  updateAgentRegistryEntry,
  updatePartyRoleEntry
} from "@aas-companion/db";
import { authorityMatrixRules, buildGovernanceCoverageAssessment, type AiAccelerationLevel } from "@aas-companion/domain";
import { failure, success } from "./shared";

type GovernanceSourceEntity = "outcome" | "story";

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function buildAuthorityAssignments(input: {
  people: Awaited<ReturnType<typeof listPartyRoleEntries>>;
}) {
  const activePeople = input.people.filter((person) => person.isActive);

  return authorityMatrixRules.map((rule) => {
    const customerAssignments = activePeople.filter(
      (person) => person.organizationSide === "customer" && rule.customerRoleTypes.includes(person.roleType)
    );
    const supplierAssignments = activePeople.filter(
      (person) => person.organizationSide === "supplier" && rule.supplierRoleTypes.includes(person.roleType)
    );
    const aiGovernanceAssignments = activePeople.filter((person) => rule.aiGovernanceRoleTypes.includes(person.roleType));

    return {
      ...rule,
      customerAssignments,
      supplierAssignments,
      aiGovernanceAssignments,
      isCovered:
        (rule.customerAssignment === "not_assigned" || customerAssignments.length > 0) &&
        (rule.supplierAssignment === "not_assigned" || supplierAssignments.length > 0) &&
        (rule.aiGovernanceAssignment === "not_assigned" || aiGovernanceAssignments.length > 0)
    };
  });
}

async function getGovernanceSourceContext(input: {
  organizationId: string;
  sourceEntity?: GovernanceSourceEntity;
  sourceId?: string;
}) {
  if (!input.sourceEntity || !input.sourceId) {
    return null;
  }

  if (input.sourceEntity === "outcome") {
    const outcome = await getOutcomeById(input.organizationId, input.sourceId);

    if (!outcome) {
      return null;
    }

    return {
      entityType: "outcome" as const,
      entityId: outcome.id,
      key: outcome.key,
      title: outcome.title,
      aiAccelerationLevel: outcome.aiAccelerationLevel
    };
  }

  const story = await getStoryById(input.organizationId, input.sourceId);

  if (!story) {
    return null;
  }

  return {
    entityType: "story" as const,
    entityId: story.id,
    key: story.key,
    title: story.title,
    aiAccelerationLevel: story.aiAccelerationLevel
  };
}

export async function getGovernanceWorkspaceService(input: {
  organizationId: string;
  aiAccelerationLevel?: AiAccelerationLevel;
  sourceEntity?: GovernanceSourceEntity;
  sourceId?: string;
}) {
  const [people, agents, requirements, riskRules, signoffRecords, sourceContext] = await Promise.all([
    listPartyRoleEntries(input.organizationId, { includeInactive: true }),
    listAgentRegistryEntries(input.organizationId, { includeInactive: true }),
    listGovernanceRoleRequirements(input.organizationId),
    listGovernanceRiskCombinationRules(input.organizationId),
    listSignoffRecordsForOrganization(input.organizationId),
    getGovernanceSourceContext(input)
  ]);

  const selectedAiLevel = input.aiAccelerationLevel ?? sourceContext?.aiAccelerationLevel ?? "level_3";
  const readiness = buildGovernanceCoverageAssessment({
    aiAccelerationLevel: selectedAiLevel,
    requirements,
    riskRules,
    people,
    agents
  });
  const authorityMatrix = buildAuthorityAssignments({ people });
  const scopedSignoffRecords = sourceContext
    ? signoffRecords.filter(
        (record) => record.entityType === sourceContext.entityType && record.entityId === sourceContext.entityId
      )
    : signoffRecords;

  return success({
    people,
    agents,
    requirements,
    riskRules,
    signoffRecords: scopedSignoffRecords,
    sourceContext,
    selectedAiLevel,
    readiness,
    authorityMatrix,
    summaries: {
      activePeople: people.filter((person) => person.isActive).length,
      customerPeople: people.filter((person) => person.isActive && person.organizationSide === "customer").length,
      supplierPeople: people.filter((person) => person.isActive && person.organizationSide === "supplier").length,
      activeAgents: agents.filter((agent) => agent.isActive).length,
      supervisedAgents: agents.filter((agent) => agent.isActive && agent.supervisingPartyRole.isActive).length
    }
  });
}

export async function createPartyRoleEntryService(input: unknown) {
  try {
    return success(await createPartyRoleEntry(input));
  } catch (error) {
    return failure({
      code: "party_role_entry_invalid",
      message: toMessage(error, "Party role entry could not be created.")
    });
  }
}

export async function updatePartyRoleEntryService(input: unknown) {
  try {
    return success(await updatePartyRoleEntry(input));
  } catch (error) {
    return failure({
      code: "party_role_entry_invalid",
      message: toMessage(error, "Party role entry could not be updated.")
    });
  }
}

export async function createAgentRegistryEntryService(input: unknown) {
  try {
    return success(await createAgentRegistryEntry(input));
  } catch (error) {
    return failure({
      code: "agent_registry_entry_invalid",
      message: toMessage(error, "Agent registry entry could not be created.")
    });
  }
}

export async function updateAgentRegistryEntryService(input: unknown) {
  try {
    return success(await updateAgentRegistryEntry(input));
  } catch (error) {
    return failure({
      code: "agent_registry_entry_invalid",
      message: toMessage(error, "Agent registry entry could not be updated.")
    });
  }
}
