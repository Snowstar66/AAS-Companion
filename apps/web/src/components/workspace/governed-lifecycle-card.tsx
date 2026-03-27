import { AlertTriangle, ArchiveRestore, ShieldAlert, Trash2 } from "lucide-react";
import type { GovernedRemovalDecision } from "@aas-companion/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { PendingFormButton } from "@/components/shared/pending-form-button";

type HiddenField = {
  name: string;
  value: string;
};

type GovernedLifecycleCardProps = {
  entityId: string;
  entityLabel: string;
  decision: GovernedRemovalDecision | null;
  hideHeader?: boolean;
  hiddenFields?: HiddenField[];
  hardDeleteAction?: (formData: FormData) => void | Promise<void>;
  archiveAction?: (formData: FormData) => void | Promise<void>;
  restoreAction?: (formData: FormData) => void | Promise<void>;
};

function renderHiddenFields(fields: HiddenField[] = []) {
  return fields.map((field) => <input key={`${field.name}:${field.value}`} name={field.name} type="hidden" value={field.value} />);
}

function formatActionLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function GovernedLifecycleCard({
  entityId,
  entityLabel,
  decision,
  hideHeader = false,
  hiddenFields = [],
  hardDeleteAction,
  archiveAction,
  restoreAction
}: GovernedLifecycleCardProps) {
  if (!decision) {
    return null;
  }

  const allHiddenFields = [{ name: `${entityLabel.toLowerCase()}Id`, value: entityId }, ...hiddenFields];

  return (
    <Card className="border-border/70 shadow-sm">
      {hideHeader ? null : (
        <CardHeader>
          <CardTitle>Remove or archive in this project</CardTitle>
          <CardDescription>
            Hard delete stays easy for eligible drafts, while governed work is archived and restored inside the current project context.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-muted-foreground">
            Recommended: {formatActionLabel(decision.recommendedAction)}
          </span>
          <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-muted-foreground">
            Lifecycle: {formatActionLabel(decision.lifecycleState)}
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Governance impact:</strong> {decision.archive.governanceImpact.activityEventCount} activity
            event(s), {decision.archive.governanceImpact.tollgateCount} tollgate record(s), lineage{" "}
            {decision.archive.governanceImpact.hasLineage ? "present" : "absent"}.
          </p>
          {decision.archive.affectedChildren.length > 0 ? (
            <p className="mt-2">
              <strong className="text-foreground">Affected children:</strong>{" "}
              {decision.archive.affectedChildren.map((child) => `${child.key} (${child.objectType})`).join(", ")}
            </p>
          ) : null}
        </div>

        {decision.lifecycleState === "active" ? (
          <>
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <Trash2 className="h-4 w-4" />
                Hard delete
              </div>
              <p>{decision.hardDelete.summary}</p>
              {decision.hardDelete.blockers.length > 0 ? (
                <ul className="space-y-1">
                  {decision.hardDelete.blockers.map((blocker) => (
                    <li key={blocker}>{blocker}</li>
                  ))}
                </ul>
              ) : null}
              {decision.hardDelete.allowed && hardDeleteAction ? (
                <form action={hardDeleteAction} className="space-y-3">
                  {renderHiddenFields(allHiddenFields)}
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input className="h-4 w-4" name="confirmAction" type="checkbox" value="yes" />
                    I understand this action is irreversible.
                  </label>
                  <PendingFormButton
                    className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                    icon={<Trash2 className="h-4 w-4" />}
                    label={`Permanently delete draft ${entityLabel}`}
                    pendingLabel={`Deleting ${entityLabel.toLowerCase()}...`}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <ShieldAlert className="h-4 w-4" />
                  Hard delete is currently blocked.
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
              <div className="flex items-center gap-2 font-medium">
                <ArchiveRestore className="h-4 w-4" />
                Archive
              </div>
              <p>{decision.archive.summary}</p>
              {archiveAction ? (
                <form action={archiveAction} className="space-y-3">
                  {renderHiddenFields(allHiddenFields)}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Archive reason</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-sky-200 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      name="archiveReason"
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input className="h-4 w-4" name="confirmAction" type="checkbox" value="yes" />
                    I understand this will remove the object from active working views.
                  </label>
                  <PendingFormButton
                    className="gap-2"
                    icon={<ArchiveRestore className="h-4 w-4" />}
                    label={`Archive ${entityLabel}`}
                    pendingLabel={`Archiving ${entityLabel.toLowerCase()}...`}
                    variant="secondary"
                  />
                </form>
              ) : null}
            </div>
          </>
        ) : (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950">
            <div className="flex items-center gap-2 font-medium">
              <ArchiveRestore className="h-4 w-4" />
              Restore
            </div>
            <p>{decision.restore.summary}</p>
            {decision.restore.blockers.length > 0 ? (
              <ul className="space-y-1">
                {decision.restore.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : null}
            {decision.restore.allowed && restoreAction ? (
              <form action={restoreAction} className="space-y-3">
                {renderHiddenFields(allHiddenFields)}
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input className="h-4 w-4" name="confirmAction" type="checkbox" value="yes" />
                  I want to restore this archived object to active work.
                </label>
                <PendingFormButton
                  className="gap-2"
                  icon={<ArchiveRestore className="h-4 w-4" />}
                  label={`Restore ${entityLabel}`}
                  pendingLabel={`Restoring ${entityLabel.toLowerCase()}...`}
                />
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-950">
                <AlertTriangle className="h-4 w-4" />
                Restore is currently blocked.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
