import { ChevronDown, Plus, UsersRound } from "lucide-react";
import { organizationSides, partyRoleTypes } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PendingFormButton } from "@/components/shared/pending-form-button";
import { GovernanceIdentityBadge } from "./governance-identity-badge";

type ReturnParams = {
  view: string;
  level: string;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
  side?: string | undefined;
};

type PartyRoleEntryView = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null | undefined;
  avatarUrl?: string | null | undefined;
  organizationSide: string;
  roleType: string;
  roleTitle: string;
  mandateNotes?: string | null | undefined;
  isActive: boolean;
};

type GovernanceDirectoryViewProps = {
  customerPeople: PartyRoleEntryView[];
  supplierPeople: PartyRoleEntryView[];
  language: "en" | "sv";
  returnParams: ReturnParams;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

function localizeRoleTitle(language: "en" | "sv", roleType: string, roleTitle: string) {
  if (language !== "sv") return roleTitle;

  const normalized = roleTitle.trim().toLowerCase();
  const byTitle: Record<string, string> = {
    "project sponsor": "Projektsponsor",
    "executive sponsor": "Projektsponsor",
    "domain owner": "DomÃ¤nÃ¤gare",
    "product owner": "ProduktÃ¤gare",
    "value owner": "VÃ¤rdeÃ¤gare",
    "risk owner": "RiskÃ¤gare",
    "solution architect": "LÃ¶sningsarkitekt",
    "customer architect": "Kundarkitekt",
    "supplier architect": "LeverantÃ¶rsarkitekt",
    "ai delivery lead": "AI-leveransledare",
    "ai delivery architect": "AI-leveransarkitekt",
    "ai quality assurance lead": "AI-kvalitetsansvarig",
    "ai quality authority": "AI-kvalitetsansvarig",
    "delivery lead": "Leveransledare",
    "full-stack builder": "Fullstackutvecklare",
    "senior builder": "Senior utvecklare"
  };

  const byRoleType: Record<string, string> = {
    customer_sponsor: "Projektsponsor",
    customer_domain_owner: "DomÃ¤nÃ¤gare",
    value_owner: "VÃ¤rdeÃ¤gare",
    risk_owner: "RiskÃ¤gare",
    architect: "LÃ¶sningsarkitekt",
    aida: "AI-leveransledare",
    aqa: "AI-kvalitetsansvarig",
    delivery_lead: "Leveransledare",
    builder: "Fullstackutvecklare"
  };

  return byTitle[normalized] ?? byRoleType[roleType] ?? roleTitle;
}

function localizeMandateNotes(
  language: "en" | "sv",
  roleType: string,
  mandateNotes?: string | null | undefined
) {
  if (language !== "sv" || !mandateNotes) return mandateNotes;

  const normalized = mandateNotes.trim();
  const byText: Record<string, string> = {
    "Owns sponsorship, budget direction, and tollgate progression for the pilot.":
      "Ã„ger sponsorskap, budgetinriktning och tollgate-framdrift fÃ¶r piloten.",
    "Owns domain rules for mushroom records, user workflows, and find data semantics.":
      "Ã„ger domÃ¤nregler fÃ¶r svampregister, anvÃ¤ndarflÃ¶den och semantiken i sÃ¶kdata.",
    "Owns business value, prioritization, and acceptance of the mushroom-finding app pilot.":
      "Ã„ger affÃ¤rsvÃ¤rde, prioritering och acceptans fÃ¶r pilotversionen av svampappen.",
    "Owns practical AI-assisted delivery setup and governed usage constraints.":
      "Ã„ger praktisk AI-assisterad leveranssetup och styrda anvÃ¤ndningsramar.",
    "Reviews AI-assisted output quality, traceability, and build readiness.":
      "Granskar kvaliteten pÃ¥ AI-assisterad output, spÃ¥rbarhet och build readiness.",
    "Owns application architecture, data design, and architecture review decisions.":
      "Ã„ger applikationsarkitektur, datadesign och beslut i arkitekturgranskningar.",
    "Owns delivery planning, sequencing, and escalations on the supplier side.":
      "Ã„ger leveransplanering, sekvensering och eskaleringar pÃ¥ leverantÃ¶rssidan.",
    "Owns business value.": "Ã„ger affÃ¤rsvÃ¤rdet.",
    "Owns delivery coordination.": "Ã„ger leveranskoordineringen.",
    "Owns architecture review.": "Ã„ger arkitekturgranskningen."
  };

  if (byText[normalized]) {
    return byText[normalized];
  }

  const roleNameByType: Record<string, string> = {
    customer_sponsor: "Projektsponsor",
    customer_domain_owner: "DomÃ¤nÃ¤gare",
    value_owner: "VÃ¤rdeÃ¤gare",
    risk_owner: "RiskÃ¤gare",
    architect: "LÃ¶sningsarkitekt",
    aida: "AI-leveransledare",
    aqa: "AI-kvalitetsansvarig",
    delivery_lead: "Leveransledare",
    builder: "Fullstackutvecklare"
  };

  const generatedPrefix = `${roleTitleForSeed(roleType, roleNameByType)} is a seeded AAS runtime role for `;
  if (normalized.startsWith(generatedPrefix) && normalized.endsWith(".")) {
    const organizationName = normalized.slice(generatedPrefix.length, -1);
    return `${roleNameByType[roleType] ?? formatLabel(roleType)} Ã¤r en seedad AAS-runtime-roll fÃ¶r ${organizationName}.`;
  }

  return mandateNotes;
}

function roleTitleForSeed(roleType: string, roleNameByType: Record<string, string>) {
  switch (roleType) {
    case "customer_sponsor":
      return "Project sponsor";
    case "customer_domain_owner":
      return "Domain owner";
    case "value_owner":
      return "Value owner";
    case "risk_owner":
      return "Risk owner";
    case "architect":
      return "Solution architect";
    case "aida":
      return "AI delivery lead";
    case "aqa":
      return "AI quality assurance lead";
    case "delivery_lead":
      return "Delivery lead";
    case "builder":
      return "Full-stack builder";
    default:
      return roleNameByType[roleType] ?? formatLabel(roleType);
  }
}

function ReturnInputs({ params }: { params: ReturnParams }) {
  return (
    <>
      <input name="returnView" type="hidden" value={params.view} />
      <input name="returnLevel" type="hidden" value={params.level} />
      <input name="returnSourceEntity" type="hidden" value={params.sourceEntity ?? ""} />
      <input name="returnSourceId" type="hidden" value={params.sourceId ?? ""} />
      <input name="returnSide" type="hidden" value={params.side ?? ""} />
    </>
  );
}

function PeopleGroup(props: {
  label: string;
  language: "en" | "sv";
  tone: "customer" | "supplier";
  people: PartyRoleEntryView[];
  returnParams: ReturnParams;
  updateAction: GovernanceDirectoryViewProps["updateAction"];
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{props.label}</CardTitle>
        <CardDescription>
          {t(
            props.language,
            "Compact role list. Expand only the role you want to inspect or edit.",
            "Kompakt rollista. Expandera bara den roll du vill granska eller Ã¤ndra."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.people.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            {t(
              props.language,
              "No roles have been added for this side yet.",
              "Inga roller har lagts till fÃ¶r den hÃ¤r sidan Ã¤nnu."
            )}
          </div>
        ) : (
          props.people.map((person) => (
            <details className="group rounded-2xl border border-border/70 bg-background" key={person.id}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4">
                <div className="flex min-w-0 items-start gap-3">
                  <GovernanceIdentityBadge
                    avatarUrl={person.avatarUrl}
                    kind="human"
                    name={person.fullName}
                    tone={props.tone}
                  />
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{person.fullName}</p>
                      <span className="rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {formatLabel(person.roleType)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          person.isActive
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-border/70 bg-muted/20 text-muted-foreground"
                        }`}
                      >
                        {person.isActive ? t(props.language, "Active", "Aktiv") : t(props.language, "Inactive", "Inaktiv")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {localizeRoleTitle(props.language, person.roleType, person.roleTitle)}
                    </p>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {localizeMandateNotes(props.language, person.roleType, person.mandateNotes) ||
                        t(props.language, "No mandate notes recorded yet.", "Inga mandatnoteringar registrerade Ã¤nnu.")}
                    </p>
                  </div>
                </div>
                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180" />
              </summary>

              <div className="border-t border-border/70 px-4 py-4">
                <form action={props.updateAction} className="grid gap-4 lg:grid-cols-2">
                  <ReturnInputs params={props.returnParams} />
                  <input name="id" type="hidden" value={person.id} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Full name", "FullstÃ¤ndigt namn")}</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.fullName} name="fullName" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Email", "E-post")}</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.email} name="email" type="email" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Role title", "Rolltitel")}</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleTitle} name="roleTitle" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Role type", "Rolltyp")}</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleType} name="roleType">
                      {partyRoleTypes.map((roleType) => (
                        <option key={roleType} value={roleType}>
                          {formatLabel(roleType)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Organization side", "Organisationssida")}</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.organizationSide} name="organizationSide">
                      {organizationSides.map((side) => (
                        <option key={side} value={side}>
                          {formatLabel(side)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Phone number", "Telefonnummer")}</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.phoneNumber ?? ""} name="phoneNumber" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Avatar URL", "Avatar-URL")}</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.avatarUrl ?? ""} name="avatarUrl" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Mandate notes", "Mandatnoteringar")}</span>
                    <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={person.mandateNotes ?? ""} name="mandateNotes" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t(props.language, "Status", "Status")}</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={String(person.isActive)} name="isActive">
                      <option value="true">{t(props.language, "Active", "Aktiv")}</option>
                      <option value="false">{t(props.language, "Inactive", "Inaktiv")}</option>
                    </select>
                  </label>
                  <div className="lg:col-span-2">
                    <Button size="sm" type="submit">{t(props.language, "Save role", "Spara roll")}</Button>
                  </div>
                </form>
              </div>
            </details>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function GovernanceDirectoryView({
  customerPeople,
  supplierPeople,
  language,
  returnParams,
  createAction,
  updateAction
}: GovernanceDirectoryViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-3">
            <UsersRound className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <CardTitle>{t(language, "Party and role directory", "Part- och rollkatalog")}</CardTitle>
              <CardDescription>
                {t(
                  language,
                  "Customer and supplier roles stay grouped, compact and easy to scan.",
                  "Kund- och leverantÃ¶rsroller hÃ¥lls grupperade, kompakta och lÃ¤ttÃ¶verskÃ¥dliga."
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <details className="group rounded-2xl border border-border/70 bg-muted/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-medium text-foreground">{t(language, "Add role", "LÃ¤gg till roll")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    language,
                    "Create a named customer or supplier role only when needed.",
                    "Skapa en namngiven kund- eller leverantÃ¶rsroll bara nÃ¤r det behÃ¶vs."
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plus className="h-4 w-4" />
                <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
              </div>
            </summary>
            <div className="border-t border-border/70 px-4 py-4">
              <form action={createAction} className="grid gap-4 lg:grid-cols-2">
                <ReturnInputs params={returnParams} />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Full name", "FullstÃ¤ndigt namn")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="fullName" type="text" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Email", "E-post")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="email" type="email" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Organization side", "Organisationssida")}</span>
                  <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="customer" name="organizationSide">
                    {organizationSides.map((side) => (
                      <option key={side} value={side}>
                        {formatLabel(side)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Role type", "Rolltyp")}</span>
                  <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="value_owner" name="roleType">
                    {partyRoleTypes.map((roleType) => (
                      <option key={roleType} value={roleType}>
                        {formatLabel(roleType)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Role title", "Rolltitel")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="roleTitle" type="text" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Phone number", "Telefonnummer")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="phoneNumber" type="text" />
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Avatar URL", "Avatar-URL")}</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="avatarUrl" type="text" />
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Mandate notes", "Mandatnoteringar")}</span>
                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" name="mandateNotes" />
                </label>
                <div className="lg:col-span-2">
                  <PendingFormButton
                    className="gap-2"
                    icon={<UsersRound className="h-4 w-4" />}
                    label={t(language, "Add role", "Lägg till roll")}
                    pendingLabel={t(language, "Adding role...", "Lägger till roll...")}
                    showPendingCursor
                  />
                </div>
              </form>
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-2">
        <PeopleGroup label={t(language, "Customer", "Kund")} language={language} people={customerPeople} returnParams={returnParams} tone="customer" updateAction={updateAction} />
        <PeopleGroup label={t(language, "Supplier", "LeverantÃ¶r")} language={language} people={supplierPeople} returnParams={returnParams} tone="supplier" updateAction={updateAction} />
      </div>
    </div>
  );
}

