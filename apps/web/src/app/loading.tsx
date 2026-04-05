import { cookies } from "next/headers";
import { AppShell } from "@/components/layout/app-shell";
import { getLoadingProjectName } from "@/lib/loading-project";

async function getServerLanguage() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("aas-app-language")?.value === "sv" ? "sv" : "en";
  } catch {
    return "en";
  }
}

export default async function Loading() {
  const language = await getServerLanguage();
  const projectName = (await getLoadingProjectName()) ?? undefined;

  return (
    <AppShell
      {...(projectName ? { activeProjectName: projectName } : {})}
      topbarProps={{
        ...(projectName
          ? {
              projectName,
              sectionLabel: language === "sv" ? "Laddar arbetsyta" : "Loading workspace",
              title: language === "sv" ? "Laddar arbetsyta" : "Loading workspace",
              badge: language === "sv" ? "Projektsektion" : "Project section"
            }
          : {
              eyebrow: "AAS Companion",
              title: language === "sv" ? "Hem" : "Home",
              badge: language === "sv" ? "Projektval" : "Project selector"
            })
      }}
    >
      <section className="space-y-6">
        <div className="h-36 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-32 animate-pulse rounded-3xl border border-border/70 bg-muted/30" key={index} />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
          <div className="h-72 animate-pulse rounded-3xl border border-border/70 bg-muted/30" />
        </div>
      </section>
    </AppShell>
  );
}
