import { ChevronDown, Plus, UsersRound } from "lucide-react";
import { organizationSides, partyRoleTypes } from "@aas-companion/domain";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { GovernanceIdentityBadge } from "./governance-identity-badge";

type ReturnParams = {
  view: string;
  level: string;
  sourceEntity?: string | undefined;
  sourceId?: string | undefined;
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
  returnParams: ReturnParams;
  createAction: (formData: FormData) => void | Promise<void>;
  updateAction: (formData: FormData) => void | Promise<void>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function ReturnInputs({ params }: { params: ReturnParams }) {
  return (
    <>
      <input name="returnView" type="hidden" value={params.view} />
      <input name="returnLevel" type="hidden" value={params.level} />
      <input name="returnSourceEntity" type="hidden" value={params.sourceEntity ?? ""} />
      <input name="returnSourceId" type="hidden" value={params.sourceId ?? ""} />
    </>
  );
}

function PeopleGroup(props: {
  label: string;
  tone: "customer" | "supplier";
  people: PartyRoleEntryView[];
  returnParams: ReturnParams;
  updateAction: GovernanceDirectoryViewProps["updateAction"];
}) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{props.label}</CardTitle>
        <CardDescription>Compact role list. Expand only the role you want to inspect or edit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.people.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
            No roles have been added for this side yet.
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
                        {person.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{person.roleTitle}</p>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {person.mandateNotes || "No mandate notes recorded yet."}
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
                    <span className="text-sm font-medium text-foreground">Full name</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.fullName} name="fullName" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Email</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.email} name="email" type="email" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Role title</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleTitle} name="roleTitle" type="text" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Role type</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.roleType} name="roleType">
                      {partyRoleTypes.map((roleType) => (
                        <option key={roleType} value={roleType}>
                          {formatLabel(roleType)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Organization side</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.organizationSide} name="organizationSide">
                      {organizationSides.map((side) => (
                        <option key={side} value={side}>
                          {formatLabel(side)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Phone number</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.phoneNumber ?? ""} name="phoneNumber" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Avatar URL</span>
                    <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={person.avatarUrl ?? ""} name="avatarUrl" type="text" />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-foreground">Mandate notes</span>
                    <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" defaultValue={person.mandateNotes ?? ""} name="mandateNotes" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Status</span>
                    <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue={String(person.isActive)} name="isActive">
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <div className="lg:col-span-2">
                    <Button size="sm" type="submit">Save role</Button>
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
              <CardTitle>Party and role directory</CardTitle>
              <CardDescription>
                Customer and supplier roles stay grouped, compact and easy to scan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <details className="group rounded-2xl border border-border/70 bg-muted/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <div>
                <p className="font-medium text-foreground">Add role</p>
                <p className="mt-1 text-sm text-muted-foreground">Create a named customer or supplier role only when needed.</p>
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
                  <span className="text-sm font-medium text-foreground">Full name</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="fullName" type="text" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="email" type="email" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Organization side</span>
                  <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="customer" name="organizationSide">
                    {organizationSides.map((side) => (
                      <option key={side} value={side}>
                        {formatLabel(side)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Role type</span>
                  <select className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" defaultValue="value_owner" name="roleType">
                    {partyRoleTypes.map((roleType) => (
                      <option key={roleType} value={roleType}>
                        {formatLabel(roleType)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Role title</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="roleTitle" type="text" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Phone number</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="phoneNumber" type="text" />
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-foreground">Avatar URL</span>
                  <input className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary" name="avatarUrl" type="text" />
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium text-foreground">Mandate notes</span>
                  <textarea className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary" name="mandateNotes" />
                </label>
                <div className="lg:col-span-2">
                  <Button className="gap-2" type="submit">
                    <UsersRound className="h-4 w-4" />
                    Add role
                  </Button>
                </div>
              </form>
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-2">
        <PeopleGroup label="Customer" people={customerPeople} returnParams={returnParams} tone="customer" updateAction={updateAction} />
        <PeopleGroup label="Supplier" people={supplierPeople} returnParams={returnParams} tone="supplier" updateAction={updateAction} />
      </div>
    </div>
  );
}
