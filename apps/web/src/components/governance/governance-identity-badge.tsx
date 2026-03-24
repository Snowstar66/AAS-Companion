import { Bot, UserRound } from "lucide-react";

type GovernanceIdentityBadgeProps = {
  kind: "human" | "agent";
  name: string;
  avatarUrl?: string | null | undefined;
  tone?: "customer" | "supplier" | "neutral";
};

function getToneClasses(tone: GovernanceIdentityBadgeProps["tone"]) {
  if (tone === "customer") {
    return "border-sky-200 bg-sky-50 text-sky-800";
  }

  if (tone === "supplier") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  return "border-border/70 bg-muted/30 text-muted-foreground";
}

export function GovernanceIdentityBadge({
  kind,
  name,
  avatarUrl,
  tone = "neutral"
}: GovernanceIdentityBadgeProps) {
  const toneClasses = getToneClasses(tone);

  if (kind === "human" && avatarUrl) {
    return (
      <div className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border ${toneClasses}`}>
        <img alt={name} className="h-full w-full object-cover" src={avatarUrl} />
      </div>
    );
  }

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${toneClasses}`}>
      {kind === "human" ? <UserRound className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
    </div>
  );
}
