import type { StoryRecord } from "@aas-companion/domain";
import { prisma } from "../client";
import { withDevTiming } from "../dev-timing";
import { withEpicShape } from "./epic-shape";
import {
  attachStoryReadinessTollgateStatus,
  mapStoryReadinessTollgateStatusByEntityId
} from "./story-readiness-tollgate";

export type HomeDashboardSnapshot = {
  organization: {
    id: string;
    name: string;
  };
  counts: {
    outcomes: number;
    stories: number;
    tollgates: number;
    activityEvents: number;
  };
  outcomeStatuses: Array<{
    status: string;
  }>;
  stories: Array<{
    id: string;
    key: string;
    status: StoryRecord["status"];
    lifecycleState: StoryRecord["lifecycleState"];
    testDefinition: string | null;
    definitionOfDone: string[];
    acceptanceCriteria: string[];
    tollgateStatus?: "blocked" | "ready" | "approved" | null;
  }>;
  tollgates: Array<{
    id: string;
    entityType: string;
    entityId: string;
    tollgateType: string;
    status: string;
    blockers: string[];
  }>;
  activityEvents: Array<{
    id: string;
    entityType: string;
    entityId: string;
    eventType: string;
    createdAt: Date;
  }>;
};

export async function getProjectSpineSnapshot(organizationId: string) {
  return withDevTiming("db.getProjectSpineSnapshot", async () => {
    const [organization, storyTollgates] = await prisma.$transaction([
      prisma.organization.findUnique({
        where: {
          id: organizationId
        },
        select: {
          id: true,
          name: true,
          slug: true,
          outcomes: {
            select: {
              id: true,
              organizationId: true,
              key: true,
              title: true,
              problemStatement: true,
              outcomeStatement: true,
              baselineDefinition: true,
              baselineSource: true,
              timeframe: true,
              valueOwnerId: true,
              riskProfile: true,
              aiAccelerationLevel: true,
              status: true,
              originType: true,
              createdMode: true,
              lifecycleState: true,
              archivedAt: true,
              archiveReason: true,
              lineageSourceType: true,
              lineageSourceId: true,
              lineageNote: true,
              importedReadinessState: true,
              createdAt: true,
              updatedAt: true,
              epics: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  purpose: true,
                  summary: true,
                  originType: true,
                  lifecycleState: true,
                  importedReadinessState: true,
                  lineageSourceType: true,
                  lineageSourceId: true,
                  directionSeeds: {
                    select: {
                      id: true,
                      epicId: true,
                      key: true,
                      title: true,
                      shortDescription: true,
                      expectedBehavior: true,
                      sourceStoryId: true,
                      originType: true,
                      lifecycleState: true,
                      importedReadinessState: true,
                      lineageSourceType: true,
                      lineageSourceId: true
                    },
                    orderBy: {
                      createdAt: "asc"
                    }
                  },
                  stories: {
                    select: {
                      id: true,
                      key: true,
                      title: true,
                      valueIntent: true,
                      expectedBehavior: true,
                      status: true,
                      originType: true,
                      lifecycleState: true,
                      testDefinition: true,
                      acceptanceCriteria: true,
                      definitionOfDone: true,
                      importedReadinessState: true,
                      lineageSourceType: true,
                      lineageSourceId: true
                    },
                    orderBy: {
                      createdAt: "asc"
                    }
                  }
                },
                orderBy: {
                  createdAt: "asc"
                }
              },
              directionSeeds: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  epicId: true,
                  shortDescription: true,
                  expectedBehavior: true,
                  sourceStoryId: true,
                  originType: true,
                  lifecycleState: true,
                  importedReadinessState: true,
                  lineageSourceType: true,
                  lineageSourceId: true
                },
                orderBy: {
                  createdAt: "asc"
                }
              },
              stories: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  epicId: true,
                  valueIntent: true,
                  expectedBehavior: true,
                  status: true,
                  originType: true,
                  lifecycleState: true,
                  testDefinition: true,
                  acceptanceCriteria: true,
                  definitionOfDone: true,
                  importedReadinessState: true,
                  lineageSourceType: true,
                  lineageSourceId: true
                },
                orderBy: {
                  createdAt: "asc"
                }
              }
            },
            orderBy: {
              createdAt: "desc"
            }
          }
        }
      }),
      prisma.tollgate.findMany({
        where: {
          organizationId,
          entityType: "story",
          tollgateType: "story_readiness"
        },
        orderBy: {
          updatedAt: "desc"
        },
        select: {
          entityId: true,
          status: true
        }
      })
    ]);

    if (!organization) {
      return null;
    }

    const storyTollgateStatuses = mapStoryReadinessTollgateStatusByEntityId(storyTollgates);

    return {
      organization: {
        ...organization,
        outcomes: organization.outcomes.map((outcome) => ({
          ...outcome,
          stories: attachStoryReadinessTollgateStatus(outcome.stories, storyTollgateStatuses),
          epics: outcome.epics.map((epic) =>
            withEpicShape({
              ...epic,
              directionSeeds: epic.directionSeeds,
              stories: attachStoryReadinessTollgateStatus(epic.stories, storyTollgateStatuses)
            })
          ),
          directionSeeds: outcome.directionSeeds
        }))
      }
    };
  }, `organizationId=${organizationId}`);
}

export async function getWorkspaceSnapshot(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId
    },
    select: {
      id: true,
      name: true,
      slug: true,
      outcomes: {
        select: {
          id: true,
          organizationId: true,
          key: true,
          title: true,
          problemStatement: true,
          outcomeStatement: true,
          baselineDefinition: true,
          baselineSource: true,
          timeframe: true,
          valueOwnerId: true,
          riskProfile: true,
          aiAccelerationLevel: true,
          status: true,
          originType: true,
          createdMode: true,
          lifecycleState: true,
          archivedAt: true,
          archiveReason: true,
          lineageSourceType: true,
          lineageSourceId: true,
          lineageNote: true,
          importedReadinessState: true,
          createdAt: true,
          updatedAt: true,
          epics: {
            select: {
              id: true,
              key: true,
              title: true,
              purpose: true,
              summary: true,
              originType: true,
              lifecycleState: true,
              importedReadinessState: true,
              lineageSourceType: true,
              lineageSourceId: true,
              directionSeeds: {
                select: {
                  id: true,
                  epicId: true,
                  key: true,
                  title: true,
                  shortDescription: true,
                  expectedBehavior: true,
                  sourceStoryId: true,
                  originType: true,
                  lifecycleState: true,
                  importedReadinessState: true,
                  lineageSourceType: true,
                  lineageSourceId: true
                },
                orderBy: {
                  createdAt: "asc"
                }
              },
              stories: {
                select: {
                  id: true,
                  key: true,
                  title: true,
                  valueIntent: true,
                  expectedBehavior: true,
                  status: true,
                  originType: true,
                  lifecycleState: true,
                  testDefinition: true,
                  acceptanceCriteria: true,
                  definitionOfDone: true,
                  importedReadinessState: true,
                  lineageSourceType: true,
                  lineageSourceId: true
                },
                orderBy: {
                  createdAt: "asc"
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          directionSeeds: {
            select: {
              id: true,
              key: true,
              title: true,
              epicId: true,
              shortDescription: true,
              expectedBehavior: true,
              sourceStoryId: true,
              originType: true,
              lifecycleState: true,
              importedReadinessState: true,
              lineageSourceType: true,
              lineageSourceId: true
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          stories: {
            select: {
              id: true,
              key: true,
              title: true,
              epicId: true,
              valueIntent: true,
              expectedBehavior: true,
              status: true,
              originType: true,
              lifecycleState: true,
              testDefinition: true,
              acceptanceCriteria: true,
              definitionOfDone: true,
              importedReadinessState: true,
              lineageSourceType: true,
              lineageSourceId: true
            },
            orderBy: {
              createdAt: "asc"
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      stories: {
        select: {
          id: true,
          key: true,
          status: true,
          lifecycleState: true,
          testDefinition: true,
          definitionOfDone: true,
          acceptanceCriteria: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      tollgates: {
        select: {
          id: true,
          entityType: true,
          entityId: true,
          tollgateType: true,
          status: true,
          blockers: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: "desc"
        },
        take: 5
      },
      activityEvents: {
        select: {
          id: true,
          entityType: true,
          entityId: true,
          eventType: true,
          createdAt: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 10
      },
      _count: {
        select: {
          outcomes: true,
          epics: true,
          stories: true,
          tollgates: true,
          activityEvents: true
        }
      }
    }
  });

  if (!organization) {
    return null;
  }

  return {
    organization: {
      ...organization,
      outcomes: organization.outcomes.map((outcome) => ({
        ...outcome,
        directionSeeds: outcome.directionSeeds,
        epics: outcome.epics.map((epic) =>
          withEpicShape({
            ...epic,
            directionSeeds: epic.directionSeeds,
            stories: epic.stories
          })
        )
      }))
    },
    counts: {
      outcomes: organization._count.outcomes,
      epics: organization._count.epics,
      stories: organization._count.stories,
      tollgates: organization._count.tollgates,
      activityEvents: organization._count.activityEvents
    }
  };
}

export async function getHomeDashboardSnapshot(organizationId: string): Promise<HomeDashboardSnapshot | null> {
  const [organization, outcomeStatuses, stories, storyTollgates] = await prisma.$transaction([
    prisma.organization.findUnique({
      where: {
        id: organizationId
      },
      select: {
        id: true,
        name: true,
        tollgates: {
          orderBy: {
            updatedAt: "desc"
          },
          select: {
            id: true,
            entityType: true,
            entityId: true,
            tollgateType: true,
            status: true,
            blockers: true
          }
        },
        activityEvents: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10,
          select: {
            id: true,
            entityType: true,
            entityId: true,
            eventType: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            outcomes: true,
            stories: true,
            tollgates: true,
            activityEvents: true
          }
        }
      }
    }),
    prisma.outcome.findMany({
      where: {
        organizationId,
        lifecycleState: "active"
      },
      select: {
        status: true
      }
    }),
    prisma.story.findMany({
      where: {
        organizationId,
        lifecycleState: "active"
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        key: true,
        status: true,
        lifecycleState: true,
        testDefinition: true,
        definitionOfDone: true,
        acceptanceCriteria: true
      }
    }),
    prisma.tollgate.findMany({
      where: {
        organizationId,
        entityType: "story",
        tollgateType: "story_readiness"
      },
      select: {
        entityId: true,
        status: true
      }
    })
  ]);

  if (!organization) {
    return null;
  }

  const storyTollgateStatuses = mapStoryReadinessTollgateStatusByEntityId(storyTollgates);

  return {
    organization: {
      id: organization.id,
      name: organization.name
    },
    counts: {
      outcomes: organization._count.outcomes,
      stories: organization._count.stories,
      tollgates: organization._count.tollgates,
      activityEvents: organization._count.activityEvents
    },
    outcomeStatuses: outcomeStatuses.map((item) => ({
      status: item.status
    })),
    stories: attachStoryReadinessTollgateStatus(stories, storyTollgateStatuses),
    tollgates: organization.tollgates,
    activityEvents: organization.activityEvents
  };
}
