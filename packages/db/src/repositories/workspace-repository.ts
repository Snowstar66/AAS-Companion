import { prisma } from "../client";
import { withEpicShape } from "./epic-shape";

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
