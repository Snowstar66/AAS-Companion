import { prisma } from "../client";

export async function getWorkspaceSnapshot(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId
    },
    include: {
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
      epics: {
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
      }
    }
  });

  if (!organization) {
    return null;
  }

  return {
    organization,
    counts: {
      outcomes: organization.outcomes.length,
      epics: organization.epics.length,
      stories: organization.stories.length,
      tollgates: organization.tollgates.length,
      activityEvents: organization.activityEvents.length
    }
  };
}
