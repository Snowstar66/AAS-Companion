import type { StoryRecord } from "@aas-companion/domain";
import { prisma } from "../client";
import { withEpicShape } from "./epic-shape";

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
    testDefinition: string | null;
    definitionOfDone: string[];
    acceptanceCriteria: string[];
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
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId
    },
    select: {
      id: true,
      name: true,
      slug: true,
      outcomes: {
        include: {
          epics: {
            include: {
              stories: {
                orderBy: {
                  createdAt: "asc"
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          stories: {
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
  });

  if (!organization) {
    return null;
  }

  return {
    organization: {
      ...organization,
      outcomes: organization.outcomes.map((outcome) => ({
        ...outcome,
        epics: outcome.epics.map((epic) =>
          withEpicShape({
            ...epic,
            stories: epic.stories
          })
        )
      }))
    }
  };
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
        include: {
          epics: {
            include: {
              stories: {
                orderBy: {
                  createdAt: "asc"
                }
              }
            },
            orderBy: {
              createdAt: "asc"
            }
          },
          stories: {
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
        orderBy: {
          createdAt: "desc"
        }
      },
      tollgates: {
        orderBy: {
          updatedAt: "desc"
        },
        take: 5
      },
      activityEvents: {
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
        epics: outcome.epics.map((epic) =>
          withEpicShape({
            ...epic,
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
  const [organization, outcomeStatuses, stories] = await prisma.$transaction([
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
          take: 5,
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
        organizationId
      },
      select: {
        status: true
      }
    }),
    prisma.story.findMany({
      where: {
        organizationId
      },
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        key: true,
        status: true,
        testDefinition: true,
        definitionOfDone: true,
        acceptanceCriteria: true
      }
    })
  ]);

  if (!organization) {
    return null;
  }

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
    stories,
    tollgates: organization.tollgates,
    activityEvents: organization.activityEvents
  };
}
