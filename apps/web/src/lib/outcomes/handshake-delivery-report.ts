import { isLikelyDeliveryStory } from "@/lib/framing/story-idea-delivery-feedback";

export type ApprovedHandshakeStoryIdea = {
  key: string;
  title: string;
  linkedEpic: string | null;
  sourceType: "direction_seed" | "legacy_story_idea";
};

export type CurrentHandshakeSeed = {
  id: string;
  key: string;
  title: string;
  sourceStoryId?: string | null;
};

export type CurrentHandshakeDeliveryStory = {
  id: string;
  key: string;
  title: string;
  epicKey: string | null;
  epicTitle: string | null;
  sourceDirectionSeedId?: string | null;
  status?: string | null;
  acceptanceCriteria?: string[];
  definitionOfDone?: string[];
  testDefinition?: string | null;
  tollgateStatus?: "blocked" | "ready" | "approved" | null;
};

export type HandshakeCoverageStatus = "covered" | "reshaped_within_handshake" | "not_implemented";

export type HandshakeCoverageRow = {
  idea: ApprovedHandshakeStoryIdea;
  matchedSeedId: string | null;
  status: HandshakeCoverageStatus;
  linkedDeliveryStories: CurrentHandshakeDeliveryStory[];
};

export type HandshakeDeliveryReport = {
  summary: {
    approvedIdeaCount: number;
    coveredCount: number;
    reshapedCount: number;
    notImplementedCount: number;
    outsideHandshakeCount: number;
  };
  coverageRows: HandshakeCoverageRow[];
  outsideHandshakeStories: CurrentHandshakeDeliveryStory[];
};

function findMatchingSeed(idea: ApprovedHandshakeStoryIdea, seeds: CurrentHandshakeSeed[]) {
  return (
    seeds.find((seed) => seed.key === idea.key) ??
    seeds.find((seed) => seed.title.trim().toLowerCase() === idea.title.trim().toLowerCase()) ??
    null
  );
}

function getCoverageStatus(input: {
  linkedDeliveryStories: CurrentHandshakeDeliveryStory[];
  approvedEpicKey: string | null;
}): HandshakeCoverageStatus {
  if (input.linkedDeliveryStories.length === 0) {
    return "not_implemented";
  }

  const crossesEpicBoundary = Boolean(
    input.approvedEpicKey &&
      input.linkedDeliveryStories.some((story) => story.epicKey && story.epicKey !== input.approvedEpicKey)
  );

  if (input.linkedDeliveryStories.length > 1 || crossesEpicBoundary) {
    return "reshaped_within_handshake";
  }

  return "covered";
}

export function buildHandshakeDeliveryReport(input: {
  approvedStoryIdeas: ApprovedHandshakeStoryIdea[];
  currentSeeds: CurrentHandshakeSeed[];
  currentStories: CurrentHandshakeDeliveryStory[];
}): HandshakeDeliveryReport {
  const legacySourceStoryIds = new Set(
    input.currentSeeds.map((seed) => seed.sourceStoryId).filter((value): value is string => Boolean(value))
  );

  const outsideHandshakeStories = input.currentStories.filter(
    (story) => !story.sourceDirectionSeedId && isLikelyDeliveryStory(story, legacySourceStoryIds)
  );

  const coverageRows = input.approvedStoryIdeas.map((idea) => {
    const matchedSeed = findMatchingSeed(idea, input.currentSeeds);
    const linkedDeliveryStories = matchedSeed
      ? input.currentStories.filter((story) => story.sourceDirectionSeedId === matchedSeed.id)
      : [];
    const status = getCoverageStatus({
      linkedDeliveryStories,
      approvedEpicKey: idea.linkedEpic
    });

    return {
      idea,
      matchedSeedId: matchedSeed?.id ?? null,
      status,
      linkedDeliveryStories
    };
  });

  return {
    summary: {
      approvedIdeaCount: coverageRows.length,
      coveredCount: coverageRows.filter((row) => row.status === "covered").length,
      reshapedCount: coverageRows.filter((row) => row.status === "reshaped_within_handshake").length,
      notImplementedCount: coverageRows.filter((row) => row.status === "not_implemented").length,
      outsideHandshakeCount: outsideHandshakeStories.length
    },
    coverageRows,
    outsideHandshakeStories
  };
}
