"use client";

import { AlertTriangle, ArchiveRestore, ShieldAlert, Trash2 } from "lucide-react";
import type { GovernedRemovalDecision } from "@aas-companion/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
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
  const { language } = useAppChromeLanguage();
  const t = (en: string, sv: string) => (language === "sv" ? sv : en);

  if (!decision) {
    return null;
  }

  const allHiddenFields = [{ name: `${entityLabel.toLowerCase()}Id`, value: entityId }, ...hiddenFields];
  const localizedEntityLabel =
    entityLabel.toLowerCase() === "story"
      ? t("Story", "Story")
      : entityLabel.toLowerCase() === "epic"
        ? t("Epic", "Epic")
        : entityLabel.toLowerCase() === "outcome"
          ? t("Framing", "Framing")
          : entityLabel;

  return (
    <Card className="border-border/70 shadow-sm">
      {hideHeader ? null : (
        <CardHeader>
          <CardTitle>{t("Remove or archive in this project", "Ta bort eller arkivera i det har projektet")}</CardTitle>
          <CardDescription>
            {t(
              "Hard delete stays easy for eligible drafts, while governed work is archived and restored inside the current project context.",
              "Permanent borttagning forblir enkelt for utkast som far tas bort, medan styrt arbete arkiveras och aterstalls inom aktuell projektkontext."
            )}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          <span className="rounded-full border border-border/70 bg-muted px-3 py-1 text-muted-foreground">
            {t("Recommended", "Rekommenderat")}: {formatActionLabel(decision.recommendedAction)}
          </span>
          <span className="rounded-full border border-border/70 bg-background px-3 py-1 text-muted-foreground">
            {t("Lifecycle", "Livscykel")}: {formatActionLabel(decision.lifecycleState)}
          </span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">{t("Governance impact", "Governance-paverkan")}:</strong>{" "}
            {decision.archive.governanceImpact.activityEventCount} {t("activity event(s)", "aktivitetshandelser")},{" "}
            {decision.archive.governanceImpact.tollgateCount} {t("tollgate record(s)", "tollgate-poster")},{" "}
            {t("lineage", "lineage")} {decision.archive.governanceImpact.hasLineage ? t("present", "finns") : t("absent", "saknas")}.
          </p>
          {decision.archive.affectedChildren.length > 0 ? (
            <p className="mt-2">
              <strong className="text-foreground">{t("Affected children", "Paverkade barnobjekt")}:</strong>{" "}
              {decision.archive.affectedChildren.map((child) => `${child.key} (${child.objectType})`).join(", ")}
            </p>
          ) : null}
        </div>

        {decision.lifecycleState === "active" ? (
          <>
            <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
              <div className="flex items-center gap-2 font-medium">
                <Trash2 className="h-4 w-4" />
                {t("Hard delete", "Permanent borttagning")}
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
                    {t("I understand this action is irreversible.", "Jag forstar att den har atgarden inte gar att angra.")}
                  </label>
                  <PendingFormButton
                    className="gap-2 border border-red-300 bg-red-600 text-white hover:opacity-95"
                    icon={<Trash2 className="h-4 w-4" />}
                    label={t(`Permanently delete draft ${localizedEntityLabel}`, `Ta bort utkastet ${localizedEntityLabel} permanent`)}
                    pendingLabel={t(`Deleting ${localizedEntityLabel.toLowerCase()}...`, `Tar bort ${localizedEntityLabel.toLowerCase()}...`)}
                  />
                </form>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                  <ShieldAlert className="h-4 w-4" />
                  {t("Hard delete is currently blocked.", "Permanent borttagning ar blockerad just nu.")}
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-950">
              <div className="flex items-center gap-2 font-medium">
                <ArchiveRestore className="h-4 w-4" />
                {t("Archive", "Arkivera")}
              </div>
              <p>{decision.archive.summary}</p>
              {archiveAction ? (
                <form action={archiveAction} className="space-y-3">
                  {renderHiddenFields(allHiddenFields)}
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">{t("Archive reason", "Orsak till arkivering")}</span>
                    <textarea
                      className="min-h-24 w-full rounded-2xl border border-sky-200 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                      name="archiveReason"
                      required
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input className="h-4 w-4" name="confirmAction" type="checkbox" value="yes" />
                    {t(
                      "I understand this will remove the object from active working views.",
                      "Jag forstar att detta tar bort objektet fran aktiva arbetsvyer."
                    )}
                  </label>
                  <PendingFormButton
                    className="gap-2"
                    icon={<ArchiveRestore className="h-4 w-4" />}
                    label={t(`Archive ${localizedEntityLabel}`, `Arkivera ${localizedEntityLabel}`)}
                    pendingLabel={t(`Archiving ${localizedEntityLabel.toLowerCase()}...`, `Arkiverar ${localizedEntityLabel.toLowerCase()}...`)}
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
              {t("Restore", "Aterstall")}
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
                  {t("I want to restore this archived object to active work.", "Jag vill aterstalla det arkiverade objektet till aktivt arbete.")}
                </label>
                <PendingFormButton
                  className="gap-2"
                  icon={<ArchiveRestore className="h-4 w-4" />}
                  label={t(`Restore ${localizedEntityLabel}`, `Aterstall ${localizedEntityLabel}`)}
                  pendingLabel={t(`Restoring ${localizedEntityLabel.toLowerCase()}...`, `Aterstaller ${localizedEntityLabel.toLowerCase()}...`)}
                />
              </form>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-950">
                <AlertTriangle className="h-4 w-4" />
                {t("Restore is currently blocked.", "Aterstallning ar blockerad just nu.")}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
