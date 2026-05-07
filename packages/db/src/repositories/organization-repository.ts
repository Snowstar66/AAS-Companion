import type { MembershipRole } from "@aas-companion/domain";
import { Prisma } from "../../generated/client";
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

export type DuplicateOrganizationContextResult = OrganizationMembershipContext & {
  copiedCounts: {
    outcomes: number;
    epics: number;
    storyIdeas: number;
    deliveryStories: number;
    tollgates: number;
    intakeSessions: number;
    intakeFiles: number;
    intakeCandidates: number;
  };
};

export type AppUserIdentity = {
  userId: string;
  email: string;
  fullName: string | null;
};

export type OrganizationProjectUserIdentity = AppUserIdentity & {
  role: MembershipRole;
  activeOutcomeOwnerCount: number;
};

export type RemoveOrganizationProjectUserResult =
  | {
      status: "removed";
      user: OrganizationProjectUserIdentity;
      clearedOutcomeAssignments: number;
    }
  | {
      status: "blocked_last_member";
      remainingMemberCount: number;
    }
  | {
      status: "not_found";
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

async function createUniqueOrganizationNameForUser(
  db: Pick<typeof prisma, "membership">,
  input: {
    userId: string;
    preferredName: string;
  }
) {
  const baseName = normalizeProjectName(input.preferredName) || "Project copy";
  let candidate = baseName;
  let index = 2;

  for (;;) {
    const existing = await findOrganizationContextForUserByName(db, {
      userId: input.userId,
      organizationName: candidate
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${baseName} ${index}`;
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
    where: {
      memberships: {
        some: {}
      }
    },
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

export async function listOrganizationProjectUsers(
  organizationId: string
): Promise<OrganizationProjectUserIdentity[]> {
  return withDevTiming("db.listOrganizationProjectUsers", async () => {
    const [memberships, assignedOutcomes] = await Promise.all([
      prisma.membership.findMany({
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
      }),
      prisma.outcome.findMany({
        where: {
          organizationId,
          lifecycleState: "active",
          valueOwnerId: {
            not: null
          }
        },
        select: {
          valueOwnerId: true
        }
      })
    ]);

    const activeOutcomeOwnerCounts = new Map<string, number>();

    for (const outcome of assignedOutcomes) {
      if (!outcome.valueOwnerId) {
        continue;
      }

      activeOutcomeOwnerCounts.set(
        outcome.valueOwnerId,
        (activeOutcomeOwnerCounts.get(outcome.valueOwnerId) ?? 0) + 1
      );
    }

    return memberships
      .map((membership) => ({
        userId: membership.user.id,
        email: membership.user.email,
        fullName: membership.user.fullName,
        role: membership.role as MembershipRole,
        activeOutcomeOwnerCount: activeOutcomeOwnerCounts.get(membership.user.id) ?? 0
      }))
      .sort((left, right) => {
        const leftLabel = left.fullName ?? left.email;
        const rightLabel = right.fullName ?? right.email;
        return leftLabel.localeCompare(rightLabel, "en");
      });
  }, `organizationId=${organizationId}`);
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

export async function updateOrganizationProjectUser(input: {
  organizationId: string;
  userId: string;
  email: string;
  fullName?: string | null;
  role?: MembershipRole;
}): Promise<OrganizationProjectUserIdentity | null> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const normalizedFullName = input.fullName?.trim() || null;

  return withDevTiming("db.updateOrganizationProjectUser", async () => {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId
          }
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

      if (!membership) {
        return null;
      }

      const updatedUser = await tx.appUser.update({
        where: {
          id: input.userId
        },
        data: {
          email: normalizedEmail,
          fullName: normalizedFullName
        },
        select: {
          id: true,
          email: true,
          fullName: true
        }
      });

      const updatedMembership =
        input.role && input.role !== membership.role
          ? await tx.membership.update({
              where: {
                organizationId_userId: {
                  organizationId: input.organizationId,
                  userId: input.userId
                }
              },
              data: {
                role: input.role
              },
              select: {
                role: true
              }
            })
          : { role: membership.role };

      const activeOutcomeOwnerCount = await tx.outcome.count({
        where: {
          organizationId: input.organizationId,
          lifecycleState: "active",
          valueOwnerId: input.userId
        }
      });

      return {
        userId: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedMembership.role as MembershipRole,
        activeOutcomeOwnerCount
      } satisfies OrganizationProjectUserIdentity;
    });
  }, `organizationId=${input.organizationId} userId=${input.userId}`);
}

export async function removeOrganizationProjectUser(input: {
  organizationId: string;
  userId: string;
}): Promise<RemoveOrganizationProjectUserResult> {
  return withDevTiming("db.removeOrganizationProjectUser", async () => {
    return prisma.$transaction(async (tx) => {
      const [membership, memberCount] = await Promise.all([
        tx.membership.findUnique({
          where: {
            organizationId_userId: {
              organizationId: input.organizationId,
              userId: input.userId
            }
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
        }),
        tx.membership.count({
          where: {
            organizationId: input.organizationId
          }
        })
      ]);

      if (!membership) {
        return {
          status: "not_found"
        } satisfies RemoveOrganizationProjectUserResult;
      }

      if (memberCount <= 1) {
        return {
          status: "blocked_last_member",
          remainingMemberCount: memberCount
        } satisfies RemoveOrganizationProjectUserResult;
      }

      const clearedAssignments = await tx.outcome.updateMany({
        where: {
          organizationId: input.organizationId,
          valueOwnerId: input.userId
        },
        data: {
          valueOwnerId: null
        }
      });

      await tx.membership.delete({
        where: {
          organizationId_userId: {
            organizationId: input.organizationId,
            userId: input.userId
          }
        }
      });

      return {
        status: "removed",
        user: {
          userId: membership.user.id,
          email: membership.user.email,
          fullName: membership.user.fullName,
          role: membership.role as MembershipRole,
          activeOutcomeOwnerCount: clearedAssignments.count
        },
        clearedOutcomeAssignments: clearedAssignments.count
      } satisfies RemoveOrganizationProjectUserResult;
    });
  }, `organizationId=${input.organizationId} userId=${input.userId}`);
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

function remapString(value: string, idMap: Map<string, string>) {
  return idMap.get(value) ?? value;
}

function remapNullableString(value: string | null, idMap: Map<string, string>) {
  return value ? remapString(value, idMap) : null;
}

function remapJsonValue(value: unknown, idMap: Map<string, string>): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput {
  if (value === null || value === undefined) {
    return Prisma.JsonNull;
  }

  if (typeof value === "string") {
    return remapString(value, idMap);
  }

  if (typeof value !== "object") {
    return value as Prisma.InputJsonValue;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => remapJsonValue(entry, idMap)) as Prisma.InputJsonArray;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, remapJsonValue(entry, idMap)])
  ) as Prisma.InputJsonObject;
}

function remapRequiredJsonValue(value: unknown, idMap: Map<string, string>): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return remapJsonValue(value, idMap) as Prisma.InputJsonValue | typeof Prisma.JsonNull;
}

function remapEntityId(input: {
  entityType: string;
  entityId: string;
  outcomeIds: Map<string, string>;
  epicIds: Map<string, string>;
  directionSeedIds: Map<string, string>;
  storyIds: Map<string, string>;
  tollgateIds: Map<string, string>;
  signoffRecordIds: Map<string, string>;
  partyRoleEntryIds: Map<string, string>;
  agentRegistryEntryIds: Map<string, string>;
  intakeSessionIds: Map<string, string>;
  intakeFileIds: Map<string, string>;
  artifactCandidateIds: Map<string, string>;
  organizationIds: Map<string, string>;
}) {
  const mapsByEntityType: Record<string, Map<string, string>> = {
    organization: input.organizationIds,
    outcome: input.outcomeIds,
    epic: input.epicIds,
    direction_seed: input.directionSeedIds,
    story: input.storyIds,
    tollgate: input.tollgateIds,
    signoff_record: input.signoffRecordIds,
    party_role_entry: input.partyRoleEntryIds,
    agent_registry_entry: input.agentRegistryEntryIds,
    artifact_intake_session: input.intakeSessionIds,
    artifact_intake_file: input.intakeFileIds,
    artifact_aas_candidate: input.artifactCandidateIds
  };

  return mapsByEntityType[input.entityType]?.get(input.entityId) ?? input.entityId;
}

export async function duplicateOrganizationContextForUser(input: {
  sourceOrganizationId: string;
  userId: string;
  targetOrganizationName?: string | null;
}): Promise<DuplicateOrganizationContextResult | null> {
  const sourceOrganizationId = input.sourceOrganizationId.trim();

  if (!sourceOrganizationId) {
    return null;
  }

  return withDevTiming("db.duplicateOrganizationContextForUser", async () => {
    return prisma.$transaction(async (tx) => {
      const membership = await tx.membership.findUnique({
        where: {
          organizationId_userId: {
            organizationId: sourceOrganizationId,
            userId: input.userId
          }
        },
        include: {
          organization: {
            include: {
              memberships: true,
              partyRoleEntries: true,
              agentRegistryEntries: true,
              governanceRoleRequirements: true,
              governanceRiskCombinationRules: true,
              outcomes: true,
              epics: true,
              directionSeeds: true,
              stories: true,
              tollgates: true,
              signoffRecords: true,
              activityEvents: true,
              artifactIntakeSessions: true,
              artifactIntakeFiles: true,
              artifactAasCandidates: true
            }
          }
        }
      });

      if (!membership) {
        return null;
      }

      const source = membership.organization;
      const targetName = await createUniqueOrganizationNameForUser(tx, {
        userId: input.userId,
        preferredName: input.targetOrganizationName?.trim() || `${source.name} copy`
      });
      const targetSlug = await createUniqueOrganizationSlug(targetName, tx);
      const targetOrganizationId = buildId("org");

      const organizationIds = new Map([[source.id, targetOrganizationId]]);
      const partyRoleEntryIds = new Map(source.partyRoleEntries.map((entry) => [entry.id, buildId("party_role")]));
      const agentRegistryEntryIds = new Map(source.agentRegistryEntries.map((entry) => [entry.id, buildId("agent")]));
      const outcomeIds = new Map(source.outcomes.map((entry) => [entry.id, buildId("outcome")]));
      const epicIds = new Map(source.epics.map((entry) => [entry.id, buildId("epic")]));
      const directionSeedIds = new Map(source.directionSeeds.map((entry) => [entry.id, buildId("seed")]));
      const storyIds = new Map(source.stories.map((entry) => [entry.id, buildId("story")]));
      const tollgateIds = new Map(source.tollgates.map((entry) => [entry.id, buildId("tollgate")]));
      const signoffRecordIds = new Map(source.signoffRecords.map((entry) => [entry.id, buildId("signoff")]));
      const intakeSessionIds = new Map(source.artifactIntakeSessions.map((entry) => [entry.id, buildId("intake_session")]));
      const intakeFileIds = new Map(source.artifactIntakeFiles.map((entry) => [entry.id, buildId("intake_file")]));
      const artifactCandidateIds = new Map(source.artifactAasCandidates.map((entry) => [entry.id, buildId("artifact_candidate")]));
      const allIds = new Map<string, string>([
        ...organizationIds,
        ...partyRoleEntryIds,
        ...agentRegistryEntryIds,
        ...outcomeIds,
        ...epicIds,
        ...directionSeedIds,
        ...storyIds,
        ...tollgateIds,
        ...signoffRecordIds,
        ...intakeSessionIds,
        ...intakeFileIds,
        ...artifactCandidateIds
      ]);

      await tx.organization.create({
        data: {
          id: targetOrganizationId,
          name: targetName,
          slug: targetSlug
        }
      });

      await tx.membership.createMany({
        data: source.memberships.map((sourceMembership) => ({
          id: buildId("membership"),
          organizationId: targetOrganizationId,
          userId: sourceMembership.userId,
          role: sourceMembership.role,
          createdAt: sourceMembership.createdAt,
          updatedAt: sourceMembership.updatedAt
        }))
      });

      if (source.partyRoleEntries.length > 0) {
        await tx.partyRoleEntry.createMany({
          data: source.partyRoleEntries.map((entry) => ({
            id: partyRoleEntryIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            fullName: entry.fullName,
            email: entry.email,
            phoneNumber: entry.phoneNumber,
            avatarUrl: entry.avatarUrl,
            organizationSide: entry.organizationSide,
            roleType: entry.roleType,
            roleTitle: entry.roleTitle,
            mandateNotes: entry.mandateNotes,
            isActive: entry.isActive,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.agentRegistryEntries.length > 0) {
        await tx.agentRegistryEntry.createMany({
          data: source.agentRegistryEntries.map((entry) => ({
            id: agentRegistryEntryIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            agentName: entry.agentName,
            agentType: entry.agentType,
            purpose: entry.purpose,
            scopeOfWork: entry.scopeOfWork,
            allowedArtifactTypes: entry.allowedArtifactTypes,
            allowedActions: entry.allowedActions,
            supervisingPartyRoleId: partyRoleEntryIds.get(entry.supervisingPartyRoleId) ?? entry.supervisingPartyRoleId,
            isActive: entry.isActive,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.governanceRoleRequirements.length > 0) {
        await tx.governanceRoleRequirement.createMany({
          data: source.governanceRoleRequirements.map((entry) => ({
            id: buildId("governance_role_requirement"),
            organizationId: targetOrganizationId,
            aiAccelerationLevel: entry.aiAccelerationLevel,
            organizationSide: entry.organizationSide,
            roleType: entry.roleType,
            minimumCount: entry.minimumCount,
            rationale: entry.rationale,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.governanceRiskCombinationRules.length > 0) {
        await tx.governanceRiskCombinationRule.createMany({
          data: source.governanceRiskCombinationRules.map((entry) => ({
            id: buildId("governance_risk_rule"),
            organizationId: targetOrganizationId,
            aiAccelerationLevel: entry.aiAccelerationLevel,
            primaryRoleType: entry.primaryRoleType,
            conflictingRoleType: entry.conflictingRoleType,
            rationale: entry.rationale,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.outcomes.length > 0) {
        await tx.outcome.createMany({
          data: source.outcomes.map((entry) => ({
            id: outcomeIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            key: entry.key,
            title: entry.title,
            framingVersion: entry.framingVersion,
            problemStatement: entry.problemStatement,
            outcomeStatement: entry.outcomeStatement,
            baselineDefinition: entry.baselineDefinition,
            baselineSource: entry.baselineSource,
            solutionContext: entry.solutionContext,
            solutionConstraints: entry.solutionConstraints,
            dataSensitivity: entry.dataSensitivity,
            journeyContexts: remapJsonValue(entry.journeyContexts, allIds),
            downstreamAiInstructions: remapJsonValue(entry.downstreamAiInstructions, allIds),
            deliveryType: entry.deliveryType,
            aiUsageRole: entry.aiUsageRole,
            aiExecutionPattern: entry.aiExecutionPattern,
            aiUsageIntent: entry.aiUsageIntent,
            businessImpactLevel: entry.businessImpactLevel,
            businessImpactRationale: entry.businessImpactRationale,
            dataSensitivityLevel: entry.dataSensitivityLevel,
            dataSensitivityRationale: entry.dataSensitivityRationale,
            blastRadiusLevel: entry.blastRadiusLevel,
            blastRadiusRationale: entry.blastRadiusRationale,
            decisionImpactLevel: entry.decisionImpactLevel,
            decisionImpactRationale: entry.decisionImpactRationale,
            aiLevelJustification: entry.aiLevelJustification,
            riskAcceptedAt: entry.riskAcceptedAt,
            riskAcceptedByValueOwnerId: entry.riskAcceptedByValueOwnerId,
            timeframe: entry.timeframe,
            valueOwnerId: entry.valueOwnerId,
            riskProfile: entry.riskProfile,
            aiAccelerationLevel: entry.aiAccelerationLevel,
            status: entry.status,
            originType: entry.originType,
            createdMode: entry.createdMode,
            lifecycleState: entry.lifecycleState,
            archivedAt: entry.archivedAt,
            archiveReason: entry.archiveReason,
            lineageSourceType: entry.lineageSourceType,
            lineageSourceId: remapNullableString(entry.lineageSourceId, allIds),
            lineageNote: entry.lineageNote,
            importedReadinessState: entry.importedReadinessState,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.epics.length > 0) {
        await tx.epic.createMany({
          data: source.epics.map((entry) => ({
            id: epicIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            outcomeId: outcomeIds.get(entry.outcomeId) ?? entry.outcomeId,
            key: entry.key,
            title: entry.title,
            purpose: entry.purpose,
            summary: entry.summary,
            status: entry.status,
            originType: entry.originType,
            createdMode: entry.createdMode,
            lifecycleState: entry.lifecycleState,
            archivedAt: entry.archivedAt,
            archiveReason: entry.archiveReason,
            lineageSourceType: entry.lineageSourceType,
            lineageSourceId: remapNullableString(entry.lineageSourceId, allIds),
            lineageNote: entry.lineageNote,
            importedReadinessState: entry.importedReadinessState,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.directionSeeds.length > 0) {
        await tx.directionSeed.createMany({
          data: source.directionSeeds.map((entry) => ({
            id: directionSeedIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            outcomeId: outcomeIds.get(entry.outcomeId) ?? entry.outcomeId,
            epicId: epicIds.get(entry.epicId) ?? entry.epicId,
            key: entry.key,
            title: entry.title,
            shortDescription: entry.shortDescription,
            expectedBehavior: entry.expectedBehavior,
            uxSketchName: entry.uxSketchName,
            uxSketchContentType: entry.uxSketchContentType,
            uxSketchDataUrl: entry.uxSketchDataUrl,
            uxSketches: remapJsonValue(entry.uxSketches, allIds),
            sourceStoryId: remapNullableString(entry.sourceStoryId, storyIds),
            originType: entry.originType,
            createdMode: entry.createdMode,
            lifecycleState: entry.lifecycleState,
            archivedAt: entry.archivedAt,
            archiveReason: entry.archiveReason,
            lineageSourceType: entry.lineageSourceType,
            lineageSourceId: remapNullableString(entry.lineageSourceId, allIds),
            lineageNote: entry.lineageNote,
            importedReadinessState: entry.importedReadinessState,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.stories.length > 0) {
        await tx.story.createMany({
          data: source.stories.map((entry) => ({
            id: storyIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            outcomeId: outcomeIds.get(entry.outcomeId) ?? entry.outcomeId,
            epicId: epicIds.get(entry.epicId) ?? entry.epicId,
            key: entry.key,
            title: entry.title,
            storyType: entry.storyType,
            valueIntent: entry.valueIntent,
            expectedBehavior: entry.expectedBehavior,
            uxSketchName: entry.uxSketchName,
            uxSketchContentType: entry.uxSketchContentType,
            uxSketchDataUrl: entry.uxSketchDataUrl,
            uxSketches: remapJsonValue(entry.uxSketches, allIds),
            acceptanceCriteria: entry.acceptanceCriteria,
            aiUsageScope: entry.aiUsageScope,
            aiAccelerationLevel: entry.aiAccelerationLevel,
            testDefinition: entry.testDefinition,
            definitionOfDone: entry.definitionOfDone,
            sourceDirectionSeedId: remapNullableString(entry.sourceDirectionSeedId, directionSeedIds),
            status: entry.status,
            originType: entry.originType,
            createdMode: entry.createdMode,
            lifecycleState: entry.lifecycleState,
            archivedAt: entry.archivedAt,
            archiveReason: entry.archiveReason,
            lineageSourceType: entry.lineageSourceType,
            lineageSourceId: remapNullableString(entry.lineageSourceId, allIds),
            lineageNote: entry.lineageNote,
            importedReadinessState: entry.importedReadinessState,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.tollgates.length > 0) {
        await tx.tollgate.createMany({
          data: source.tollgates.map((entry) => ({
            id: tollgateIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            entityType: entry.entityType,
            entityId:
              entry.entityType === "outcome"
                ? outcomeIds.get(entry.entityId) ?? entry.entityId
                : storyIds.get(entry.entityId) ?? entry.entityId,
            tollgateType: entry.tollgateType,
            status: entry.status,
            blockers: entry.blockers,
            approverRoles: entry.approverRoles,
            submissionVersion: entry.submissionVersion,
            approvedVersion: entry.approvedVersion,
            approvalSnapshot: remapJsonValue(entry.approvalSnapshot, allIds),
            decidedBy: entry.decidedBy,
            decidedAt: entry.decidedAt,
            comments: entry.comments,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.signoffRecords.length > 0) {
        await tx.signoffRecord.createMany({
          data: source.signoffRecords.map((entry) => ({
            id: signoffRecordIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            entityType: entry.entityType,
            entityId:
              entry.entityType === "outcome"
                ? outcomeIds.get(entry.entityId) ?? entry.entityId
                : storyIds.get(entry.entityId) ?? entry.entityId,
            entityVersion: entry.entityVersion,
            tollgateId: remapNullableString(entry.tollgateId, tollgateIds),
            tollgateType: entry.tollgateType,
            decisionKind: entry.decisionKind,
            requiredRoleType: entry.requiredRoleType,
            actualPartyRoleEntryId: partyRoleEntryIds.get(entry.actualPartyRoleEntryId) ?? entry.actualPartyRoleEntryId,
            actualPersonName: entry.actualPersonName,
            actualPersonEmail: entry.actualPersonEmail,
            actualRoleTitle: entry.actualRoleTitle,
            organizationSide: entry.organizationSide,
            decisionStatus: entry.decisionStatus,
            note: entry.note,
            evidenceReference: entry.evidenceReference,
            createdBy: entry.createdBy,
            createdAt: entry.createdAt
          }))
        });
      }

      if (source.artifactIntakeSessions.length > 0) {
        await tx.artifactIntakeSession.createMany({
          data: source.artifactIntakeSessions.map((entry) => ({
            id: intakeSessionIds.get(entry.id)!,
            organizationId: targetOrganizationId,
            label: entry.label,
            importIntent: entry.importIntent,
            status: entry.status,
            mappedArtifacts: remapJsonValue(entry.mappedArtifacts, allIds),
            mappingCompletedAt: entry.mappingCompletedAt,
            createdBy: entry.createdBy,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.artifactIntakeFiles.length > 0) {
        await tx.artifactIntakeFile.createMany({
          data: source.artifactIntakeFiles.map((entry) => ({
            id: intakeFileIds.get(entry.id)!,
            intakeSessionId: intakeSessionIds.get(entry.intakeSessionId) ?? entry.intakeSessionId,
            organizationId: targetOrganizationId,
            fileName: entry.fileName,
            mimeType: entry.mimeType,
            extension: entry.extension,
            sizeBytes: entry.sizeBytes,
            content: entry.content,
            sourceTypeStatus: entry.sourceTypeStatus,
            sourceType: entry.sourceType,
            sourceTypeConfidence: entry.sourceTypeConfidence,
            classifiedAt: entry.classifiedAt,
            parsedAt: entry.parsedAt,
            parsedArtifacts: remapJsonValue(entry.parsedArtifacts, allIds),
            sectionDispositions: remapJsonValue(entry.sectionDispositions, allIds),
            uploadedBy: entry.uploadedBy,
            uploadedAt: entry.uploadedAt
          }))
        });
      }

      if (source.artifactAasCandidates.length > 0) {
        await tx.artifactAasCandidate.createMany({
          data: source.artifactAasCandidates.map((entry) => ({
            id: artifactCandidateIds.get(entry.id)!,
            intakeSessionId: intakeSessionIds.get(entry.intakeSessionId) ?? entry.intakeSessionId,
            fileId: intakeFileIds.get(entry.fileId) ?? entry.fileId,
            organizationId: targetOrganizationId,
            type: entry.type,
            title: entry.title,
            summary: entry.summary,
            mappingState: entry.mappingState,
            sourceType: entry.sourceType,
            sourceConfidence: entry.sourceConfidence,
            sourceSectionId: entry.sourceSectionId,
            sourceSectionTitle: entry.sourceSectionTitle,
            sourceSectionMarker: entry.sourceSectionMarker,
            inferredOutcomeCandidateId: remapNullableString(entry.inferredOutcomeCandidateId, allIds),
            inferredEpicCandidateId: remapNullableString(entry.inferredEpicCandidateId, allIds),
            relationshipState: entry.relationshipState,
            relationshipNote: entry.relationshipNote,
            acceptanceCriteria: entry.acceptanceCriteria,
            testNotes: entry.testNotes,
            draftRecord: remapRequiredJsonValue(entry.draftRecord, allIds),
            humanDecisions: remapRequiredJsonValue(entry.humanDecisions, allIds),
            complianceResult: remapRequiredJsonValue(entry.complianceResult, allIds),
            issueDispositions: remapJsonValue(entry.issueDispositions, allIds),
            reviewStatus: entry.reviewStatus,
            reviewComment: entry.reviewComment,
            followUpNeeded: entry.followUpNeeded,
            importedReadinessState: entry.importedReadinessState,
            promotedEntityType: entry.promotedEntityType,
            promotedEntityId: remapNullableString(entry.promotedEntityId, allIds),
            promotedAt: entry.promotedAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt
          }))
        });
      }

      if (source.activityEvents.length > 0) {
        await tx.activityEvent.createMany({
          data: source.activityEvents.map((entry) => ({
            id: buildId("event"),
            organizationId: targetOrganizationId,
            entityType: entry.entityType,
            entityId: remapEntityId({
              entityType: entry.entityType,
              entityId: entry.entityId,
              outcomeIds,
              epicIds,
              directionSeedIds,
              storyIds,
              tollgateIds,
              signoffRecordIds,
              partyRoleEntryIds,
              agentRegistryEntryIds,
              intakeSessionIds,
              intakeFileIds,
              artifactCandidateIds,
              organizationIds
            }),
            eventType: entry.eventType,
            actorId: entry.actorId,
            metadata: remapJsonValue(entry.metadata, allIds),
            createdAt: entry.createdAt
          }))
        });
      }

      return {
        organizationId: targetOrganizationId,
        organizationName: targetName,
        organizationSlug: targetSlug,
        role: membership.role as MembershipRole,
        copiedCounts: {
          outcomes: source.outcomes.length,
          epics: source.epics.length,
          storyIdeas: source.directionSeeds.length,
          deliveryStories: source.stories.length,
          tollgates: source.tollgates.length,
          intakeSessions: source.artifactIntakeSessions.length,
          intakeFiles: source.artifactIntakeFiles.length,
          intakeCandidates: source.artifactAasCandidates.length
        }
      } satisfies DuplicateOrganizationContextResult;
    });
  }, `sourceOrganizationId=${sourceOrganizationId} userId=${input.userId}`);
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
