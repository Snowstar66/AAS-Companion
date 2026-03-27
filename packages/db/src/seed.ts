export const seedRuntimeEntry = "packages/db/prisma/seed.mjs";

export type SeedStorySummary = {
  outcomes: number;
  epics: number;
  stories: number;
  tollgates: number;
  activityEvents: number;
};

export const expectedSeedShape: SeedStorySummary = {
  outcomes: 1,
  epics: 8,
  stories: 24,
  tollgates: 2,
  activityEvents: 1
};
