import { z } from "zod";

export const createDraftOutcomeSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Outcome key is required.")
    .max(32, "Outcome key must stay concise."),
  title: z
    .string()
    .trim()
    .min(3, "Outcome title must be at least 3 characters.")
    .max(120, "Outcome title must stay under 120 characters.")
});

export type CreateDraftOutcomeValues = z.infer<typeof createDraftOutcomeSchema>;

export type CreateOutcomeActionState = {
  status: "idle" | "error";
  message: string | null;
  values: CreateDraftOutcomeValues;
};

export const initialCreateOutcomeActionState: CreateOutcomeActionState = {
  status: "idle",
  message: null,
  values: {
    key: "",
    title: ""
  }
};
