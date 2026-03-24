export type CreateOutcomeActionState = {
  status: "idle" | "error";
  message: string | null;
};

export const initialCreateOutcomeActionState: CreateOutcomeActionState = {
  status: "idle",
  message: null
};
