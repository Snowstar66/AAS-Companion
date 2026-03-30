import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { getStoryWorkspaceService } from "@aas-companion/api";

export const STORY_IDEA_GUIDANCE =
  "Describe this Story Idea so it is clear enough to guide design and AI refinement, but not detailed enough to become a delivery specification.";

type StoryWorkspaceResult = Awaited<ReturnType<typeof getStoryWorkspaceService>>;

export type StoryWorkspaceData = Extract<StoryWorkspaceResult, { ok: true }>["data"];

export function formatAiLevel(value: string) {
  return value.replace("level_", "Level ").replaceAll("_", " ");
}

export function getReadinessFieldStatus(story: {
  acceptanceCriteria: string[];
  testDefinition: string | null;
  definitionOfDone: string[];
  aiAccelerationLevel: string;
}) {
  return [
    {
      key: "acceptance-criteria",
      label: "Acceptance criteria",
      href: "#story-acceptance-criteria",
      complete: story.acceptanceCriteria.length > 0,
      help: "Add at least one checkable outcome for the Story."
    },
    {
      key: "test-definition",
      label: "Test Definition",
      href: "#story-test-definition",
      complete: Boolean(story.testDefinition?.trim()),
      help: "Describe how the Story will be verified before approval."
    },
    {
      key: "definition-of-done",
      label: "Definition of Done",
      href: "#story-definition-of-done",
      complete: story.definitionOfDone.length > 0,
      help: "List the minimum conditions for considering the Story done."
    },
    {
      key: "ai-level",
      label: "AI level",
      href: "#story-ai-level",
      complete: true,
      help: `Inherited from the current Framing: ${formatAiLevel(story.aiAccelerationLevel)}.`
    }
  ] as const;
}

export function SecondaryPanel(props: {
  id?: string | undefined;
  title: string;
  description: string;
  defaultOpen?: boolean | undefined;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-border/70 bg-background shadow-sm" id={props.id} open={props.defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5">
        <div>
          <p className="font-semibold text-foreground">{props.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{props.description}</p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/70 px-6 py-5">{props.children}</div>
    </details>
  );
}
