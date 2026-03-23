export const seedRuntimeEntry = "packages/db/prisma/seed.mjs";

export type SeedStorySummary = {
  outcomes: number;
  epics: number;
  stories: number;
  tollgates: number;
  activityEvents: number;
};

export const expectedSeedShape: SeedStorySummary = {
  outcomes: 2,
  epics: 1,
  stories: 3,
  tollgates: 1,
  activityEvents: 1
};
