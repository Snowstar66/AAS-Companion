import { CircleHelp } from "lucide-react";

const termHelp = {
  Framing:
    "Framing is the business case handshake. It keeps the team aligned on problem, outcome, owner, baseline and AI level before deeper delivery design starts.",
  "Value Spine":
    "Value Spine is the scoped chain from Framing to Epics to Stories, so the team can see how delivery work stays tied to one business case.",
  Readiness:
    "Readiness means the Story has the minimum inputs needed to move into human review and later build work.",
  Tollgate:
    "A Tollgate is the governed checkpoint where named humans review or approve whether the work can progress."
} as const;

type InlineTermHelpProps = {
  term: keyof typeof termHelp;
};

export function InlineTermHelp({ term }: InlineTermHelpProps) {
  return (
    <span
      aria-label={`${term}: ${termHelp[term]}`}
      className="inline-flex align-middle text-muted-foreground"
      title={`${term}: ${termHelp[term]}`}
    >
      <span className="inline-flex rounded-full border border-border/70 bg-background/90 p-1 transition hover:text-foreground">
        <CircleHelp className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}
