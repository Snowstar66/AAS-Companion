import { HelpPageContent } from "@/components/help/help-page-content";
import { AppShell } from "@/components/layout/app-shell";

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

  return (
    <AppShell
      hideRightRail
      topbarProps={{
        title: "Help",
        sectionLabel: "Help",
        badge: "Method guide"
      }}
    >
      <HelpPageContent returnTo={returnTo} />
    </AppShell>
  );
}
