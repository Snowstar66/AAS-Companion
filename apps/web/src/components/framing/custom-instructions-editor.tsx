"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aas-companion/ui";
import { useAppChromeLanguage } from "@/components/layout/app-language";
import type { CustomInstruction, CustomInstructionCategory, CustomInstructionPriority } from "@/lib/framing/downstreamInstructionTypes";

type CustomInstructionsEditorProps = {
  instructions: CustomInstruction[];
  onAdd: () => void;
  onChange: (id: string, nextInstruction: CustomInstruction) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

const categories: CustomInstructionCategory[] = ["General", "Epic", "Story", "Journey", "Design", "Build"];
const priorities: CustomInstructionPriority[] = ["High", "Normal"];

function t(language: "en" | "sv", en: string, sv: string) {
  return language === "sv" ? sv : en;
}

export function CustomInstructionsEditor({
  instructions,
  onAdd,
  onChange,
  onDelete,
  onMove
}: CustomInstructionsEditorProps) {
  const { language } = useAppChromeLanguage();

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle>{t(language, "Custom Instructions", "Egna instruktioner")}</CardTitle>
        <CardDescription>
          {t(
            language,
            "Use Custom Instructions for anything important that downstream AI must preserve and that is not captured well enough by the structured preferences above.",
            "Använd egna instruktioner för sådant som downstream AI måste bevara och som inte fångas tillräckligt väl av de strukturerade valen ovan."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4 text-sm text-sky-900">
          {t(
            language,
            "When priority is High, the instruction is shown more prominently and ordered earlier in generated outputs.",
            "När prioriteten är High visas instruktionen mer tydligt och tidigare i genererade resultat."
          )}
        </div>

        <Button onClick={onAdd} type="button">
          {t(language, "Add Custom Instruction", "Lägg till egen instruktion")}
        </Button>

        {instructions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {t(language, "No custom instructions added yet.", "Inga egna instruktioner tillagda ännu.")}
          </div>
        ) : null}

        {instructions.map((instruction, index) => (
          <Card
            className={instruction.priority === "High" ? "border-amber-200 bg-amber-50/30 shadow-none" : "border-border/70 shadow-none"}
            key={instruction.id}
          >
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {instruction.title || `${t(language, "Instruction", "Instruktion")} ${index + 1}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {instruction.category} · {instruction.priority}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled={index === 0} onClick={() => onMove(instruction.id, "up")} size="sm" type="button" variant="secondary">
                    {t(language, "Move Up", "Flytta upp")}
                  </Button>
                  <Button
                    disabled={index === instructions.length - 1}
                    onClick={() => onMove(instruction.id, "down")}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {t(language, "Move Down", "Flytta ned")}
                  </Button>
                  <Button onClick={() => onDelete(instruction.id)} size="sm" type="button" variant="secondary">
                    {t(language, "Delete", "Ta bort")}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Title", "Titel")}</span>
                  <input
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                    onChange={(event) => onChange(instruction.id, { ...instruction, title: event.target.value })}
                    type="text"
                    value={instruction.title}
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Category", "Kategori")}</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                    onChange={(event) =>
                      onChange(instruction.id, {
                        ...instruction,
                        category: event.target.value as CustomInstructionCategory
                      })
                    }
                    value={instruction.category}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">{t(language, "Priority", "Prioritet")}</span>
                  <select
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                    onChange={(event) =>
                      onChange(instruction.id, {
                        ...instruction,
                        priority: event.target.value as CustomInstructionPriority
                      })
                    }
                    value={instruction.priority}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">{t(language, "Instruction body", "Instruktionstext")}</span>
                <textarea
                  className="min-h-32 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  onChange={(event) => onChange(instruction.id, { ...instruction, body: event.target.value })}
                  value={instruction.body}
                />
              </label>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
