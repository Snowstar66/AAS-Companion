import { HelpPageContent } from "@/components/help/help-page-content";
import { ViewerSessionProvider } from "@/components/auth/viewer-session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getAppSession } from "@/lib/auth/server";

type HelpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default async function HelpPage({ searchParams }: HelpPageProps) {
  const query = searchParams ? await searchParams : {};
  const returnTo = normalizeReturnTo(getParamValue(query.returnTo));
  const session = await getAppSession();
  const activeProjectName = session?.organization?.organizationName;

  return (
    <ViewerSessionProvider session={session}>
      <AppShell
        {...(activeProjectName ? { activeProjectName } : {})}
        hideRightRail
        topbarProps={{
          ...(activeProjectName ? { projectName: activeProjectName } : {}),
          title: "Help",
          sectionLabel: "Help",
          badge: "Method guide"
        }}
      >
        <HelpPageContent returnTo={returnTo} />
      </AppShell>
    </ViewerSessionProvider>
  );
}
