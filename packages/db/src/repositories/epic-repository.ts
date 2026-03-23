import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/client";
import { epicCreateInputSchema } from "@aas-companion/domain";
import { prisma } from "../client";
import { appendActivityEvent } from "./activity-repository";
import {
  resolveGovernedObjectProvenance,
  toGovernedObjectProvenanceFields,
  toGovernedObjectProvenanceMetadata
} from "./governed-object-provenance";

export async function createEpic(input: unknown, db: Prisma.TransactionClient | typeof prisma = prisma) {
  const parsed = epicCreateInputSchema.parse(input);
  const provenance = resolveGovernedObjectProvenance(parsed);

  const persist = async (tx: Prisma.TransactionClient) => {
    const epic = await tx.epic.create({
      data: {
        id: randomUUID(),
        organizationId: parsed.organizationId,
        outcomeId: parsed.outcomeId,
        key: parsed.key,
        title: parsed.title,
        purpose: parsed.purpose,
        status: parsed.status,
        importedReadinessState: parsed.importedReadinessState ?? null,
        ...toGovernedObjectProvenanceFields(provenance)
      }
    });

    await appendActivityEvent(
      {
        organizationId: parsed.organizationId,
        entityType: "epic",
        entityId: epic.id,
        eventType: "epic_created",
        actorId: parsed.actorId ?? null,
        metadata: {
          key: epic.key,
          status: epic.status,
          importedReadinessState: epic.importedReadinessState ?? null,
          ...toGovernedObjectProvenanceMetadata(provenance)
        }
      },
      tx
    );

    return epic;
  };

  if (db === prisma) {
    return prisma.$transaction((tx) => persist(tx));
  }

  return persist(db);
}
