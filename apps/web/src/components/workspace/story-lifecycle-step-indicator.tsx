import { CheckCircle2, Circle, CircleAlert, CircleDashed } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import type { StoryUxModel } from "@/lib/workspace/story-ux";

type StoryLifecycleStepIndicatorProps = {
  steps: StoryUxModel["lifecycleSteps"];
};

function StepIcon({ state }: { state: StoryUxModel["lifecycleSteps"][number]["state"] }) {
  if (state === "complete") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-700" />;
  }

  if (state === "attention") {
    return <CircleAlert className="h-5 w-5 text-amber-700" />;
  }

  if (state === "current") {
    return <Circle className="h-5 w-5 fill-sky-700 text-sky-700" />;
  }

  return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
}

export function StoryLifecycleStepIndicator({ steps }: StoryLifecycleStepIndicatorProps) {
  return (
    <Card className="border-border/70 shadow-sm" id="story-lifecycle">
      <CardHeader>
        <CardTitle>Story lifecycle</CardTitle>
        <CardDescription>Progress is shown in the same user-facing steps throughout the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 lg:grid-cols-5">
          {steps.map((step) => (
            <li
              className={`rounded-2xl border p-4 ${
                step.state === "complete"
                  ? "border-emerald-200 bg-emerald-50/70"
                  : step.state === "current"
                    ? "border-sky-200 bg-sky-50/80"
                    : step.state === "attention"
                      ? "border-amber-200 bg-amber-50/80"
                      : "border-border/70 bg-muted/15"
              }`}
              key={step.key}
            >
              <div className="flex items-start gap-3">
                <StepIcon state={step.state} />
                <div>
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
