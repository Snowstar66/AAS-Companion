import type { MembershipRole } from "@aas-companion/domain";
import { prisma } from "../client";
import { withDevTiming } from "../dev-timing";

export type OrganizationMembershipContext = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: MembershipRole;
};

export type OrganizationMembershipProjectSummary = OrganizationMembershipContext & {
  counts: {
    outcomes: number;
    epics: number;
    storyIdeas: number;
    deliveryStories: number;
    stories: number;
    activityEvents: number;
  };
};

export type AppUserIdentity = {
  userId: string;
  email: string;
  fullName: string | null;
};

function buildId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}

function slugifyProjectName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function normalizeProjectName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "code" in error && typeof error.code === "string" && "name" in error && error.name === "PrismaClientKnownRequestError";
}

function toMembershipContext(membership: {
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}) {
  return {
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    role: membership.role as MembershipRole
  } satisfies OrganizationMembershipContext;
}

async function createUniqueOrganizationSlug(
  baseName: string,
  db: Pick<typeof prisma, "organization"> = prisma
) {
  const baseSlug = slugifyProjectName(baseName) || "project";
  let candidate = baseSlug;
  let index = 2;

  for (;;) {
    const existing = await db.organization.findUnique({
      where: {
        slug: candidate
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseSlug}-${index}`;
    index += 1;
  }
}

async function findOrganizationContextForUserByName(
  db: Pick<typeof prisma, "membership">,
  input: {
    userId: string;
    organizationName: string;
  }
) {
  const normalizedName = normalizeProjectName(input.organizationName);

  if (!normalizedName) {
    return null;
  }

  const membership = await db.membership.findFirst({
    where: {
      userId: input.userId,
      organization: {
        name: {
          equals: normalizedName,
          mode: "insensitive"
        }
      }
    },
    include: {
      organization: true
    }
  });

  return membership ? toMembershipContext(membership) : null;
}

async function findOrganizationContextForUserBySlug(
  db: Pick<typeof prisma, "membership">,
  input: {
    userId: string;
    slug: string;
  }
) {
  if (!input.slug.trim()) {
    return null;
  }

  const membership = await db.membership.findFirst({
    where: {
      userId: input.userId,
      organization: {
        slug: input.slug
      }
    },
    include: {
      organization: true
    }
  });

  return membership ? toMembershipContext(membership) : null;
}

export async function listOrganizationContextsForUser(userId: string): Promise<OrganizationMembershipContext[]> {
  const memberships = await prisma.membership.findMany({
    where: {
      userId
    },
    include: {
      organization: true
    },
    orderBy: {
      organization: {
        name: "asc"
      }
    }
  });

  return memberships.map((membership) => ({
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    role: membership.role as MembershipRole
  }));
}

export async function listOrganizationProjectSummariesForUser(
  userId: string
): Promise<OrganizationMembershipProjectSummary[]> {
  const memberships = await prisma.membership.findMany({
    where: {
      userId
    },
    orderBy: {
      organization: {
        name: "asc"
      }
    },
    select: {
      role: true,
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          _count: {
            select: {
              outcomes: true,
              epics: true,
              directionSeeds: true,
              stories: true,
              activityEvents: true
            }
          }
        }
      }
    }
  });

  return memberships.map((membership) => ({
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    role: membership.role as MembershipRole,
    counts: {
      outcomes: membership.organization._count.outcomes,
      epics: membership.organization._count.epics,
      storyIdeas: membership.organization._count.directionSeeds,
      deliveryStories: membership.organization._count.stories,
      stories: membership.organization._count.stories,
      activityEvents: membership.organization._count.activityEvents
    }
  }));
}

export async function getOrganizationContextForUser(userId: string, organizationId: string) {
  return withDevTiming("db.getOrganizationContextForUser", async () => {
    const membership = await prisma.membership.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId
        }
      },
      include: {
        organization: true
      }
    });

    if (!membership) {
      return null;
    }

    return {
      organizationId: membership.organization.id,
      organizationName: membership.organization.name,
      organizationSlug: membership.organization.slug,
      role: membership.role as MembershipRole
    };
  }, `organizationId=${organizationId}`);
}

export async function ensureAppUser(input: {
  userId: string;
  email: string;
  fullName?: string | null;
}) {
  return prisma.appUser.upsert({
    where: {
      id: input.userId
    },
    update: {
      email: input.email,
      fullName: input.fullName ?? null
    },
    create: {
      id: input.userId,
      email: input.email,
      fullName: input.fullName ?? null
    }
  });
}

export async function getAppUserById(userId: string): Promise<AppUserIdentity | null> {
  const user = await prisma.appUser.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      email: true,
      fullName: true
    }
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName
  };
}

export async function getAppUserByEmail(email: string): Promise<AppUserIdentity | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.appUser.findUnique({
    where: {
      email: normalizedEmail
    },
    select: {
      id: true,
      email: true,
      fullName: true
    }
  });

  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    fullName: user.fullName
  };
}

export async function listAppUsers(): Promise<AppUserIdentity[]> {
  const users = await prisma.appUser.findMany({
    orderBy: [
      {
        fullName: "asc"
      },
      {
        email: "asc"
      }
    ],
    select: {
      id: true,
      email: true,
      fullName: true
    }
  });

  return users.map((user) => ({
    userId: user.id,
    email: user.email,
    fullName: user.fullName
  }));
}

export async function listOrganizationUsers(organizationId: string): Promise<AppUserIdentity[]> {
  return withDevTiming("db.listOrganizationUsers", async () => {
    const memberships = await prisma.membership.findMany({
      where: {
        organizationId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    return memberships
      .map((membership) => ({
        userId: membership.user.id,
        email: membership.user.email,
        fullName: membership.user.fullName
      }))
      .sort((left, right) => {
        const leftLabel = left.fullName ?? left.email;
        const rightLabel = right.fullName ?? right.email;
        return leftLabel.localeCompare(rightLabel, "en");
      });
  }, `organizationId=${organizationId}`);
}

export async function upsertAppUserByEmail(input: {
  email: string;
  fullName?: string | null;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();

  return prisma.appUser.upsert({
    where: {
      email: normalizedEmail
    },
    update: {
      fullName: input.fullName?.trim() || null
    },
    create: {
      id: buildId("user"),
      email: normalizedEmail,
      fullName: input.fullName?.trim() || null
    },
    select: {
      id: true,
      email: true,
      fullName: true
    }
  });
}

export async function createOrganizationContextForUser(input: {
  userId: string;
  email: string;
  fullName?: string | null;
  organizationName: string;
  role?: MembershipRole;
}) {
  const role = input.role ?? "value_owner";
  const organizationName = normalizeProjectName(input.organizationName);
  const baseSlug = slugifyProjectName(organizationName) || "project";

  const existingProject = await findOrganizationContextForUserByName(prisma, {
    userId: input.userId,
    organizationName
  });

  if (existingProject) {
    return existingProject;
  }

  return prisma.$transaction(async (tx) => {
    await tx.appUser.upsert({
      where: {
        id: input.userId
      },
      update: {
        email: input.email,
        fullName: input.fullName ?? null
      },
      create: {
        id: input.userId,
        email: input.email,
        fullName: input.fullName ?? null
      }
    });

    const existingProjectInTransaction =
      (await findOrganizationContextForUserByName(tx, {
        userId: input.userId,
        organizationName
      })) ??
      (await findOrganizationContextForUserBySlug(tx, {
        userId: input.userId,
        slug: baseSlug
      }));

    if (existingProjectInTransaction) {
      return existingProjectInTransaction;
    }

    async function createOrganizationWithSlug(slug: string) {
      const organization = await tx.organization.create({
        data: {
          id: buildId("org"),
          name: organizationName,
          slug
        }
      });

      await tx.membership.create({
        data: {
          id: buildId("membership"),
          organizationId: organization.id,
          userId: input.userId,
          role
        }
      });

      return {
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        role
      } satisfies OrganizationMembershipContext;
    }

    try {
      return await createOrganizationWithSlug(baseSlug);
    } catch (error) {
      if (!isPrismaKnownRequestError(error) || error.code !== "P2002") {
        throw error;
      }

      const existingAfterConflict = await findOrganizationContextForUserBySlug(tx, {
        userId: input.userId,
        slug: baseSlug
      });

      if (existingAfterConflict) {
        return existingAfterConflict;
      }

      const slug = await createUniqueOrganizationSlug(organizationName, tx);

      return createOrganizationWithSlug(slug);
    }
  });
}

export async function deleteOrganizationContextForUser(input: {
  organizationId: string;
  userId: string;
}) {
  const membership = await prisma.membership.findUnique({
    where: {
      organizationId_userId: {
        organizationId: input.organizationId,
        userId: input.userId
      }
    },
    include: {
      organization: true
    }
  });

  if (!membership) {
    return null;
  }

  await prisma.organization.delete({
    where: {
      id: input.organizationId
    }
  });

  return {
    organizationId: membership.organization.id,
    organizationName: membership.organization.name,
    organizationSlug: membership.organization.slug,
    role: membership.role as MembershipRole
  } satisfies OrganizationMembershipContext;
}

export async function hardDeleteOrganizationContextsForUser(input: {
  organizationIds: string[];
  userId: string;
}) {
  const organizationIds = [...new Set(input.organizationIds.map((value) => value.trim()).filter(Boolean))];

  if (organizationIds.length === 0) {
    return [];
  }

  const memberships = await prisma.membership.findMany({
    where: {
      userId: input.userId,
      organizationId: {
        in: organizationIds
      }
    },
    include: {
      organization: true
    },
    orderBy: {
      organization: {
        name: "asc"
      }
    }
  });

  if (memberships.length === 0) {
    return [];
  }

  await prisma.$transaction(async (tx) => {
    for (const membership of memberships) {
      await tx.organization.delete({
        where: {
          id: membership.organizationId
        }
      });
    }
  });

  return memberships.map((membership) => toMembershipContext(membership));
}
