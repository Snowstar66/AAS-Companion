import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

const MIN_CONNECTION_LIMIT = 10;
const MIN_POOL_TIMEOUT_SECONDS = 30;
const TRANSACTION_MAX_WAIT_MS = 30_000;
const TRANSACTION_TIMEOUT_MS = 120_000;

function applyMinimumPrismaPoolSettings(url: string | undefined) {
  if (!url?.trim()) {
    return url;
  }

  try {
    const parsed = new URL(url);
    const currentConnectionLimit = Number.parseInt(parsed.searchParams.get("connection_limit") ?? "", 10);
    const currentPoolTimeout = Number.parseInt(parsed.searchParams.get("pool_timeout") ?? "", 10);

    if (!Number.isFinite(currentConnectionLimit) || currentConnectionLimit < MIN_CONNECTION_LIMIT) {
      parsed.searchParams.set("connection_limit", String(MIN_CONNECTION_LIMIT));
    }

    if (!Number.isFinite(currentPoolTimeout) || currentPoolTimeout < MIN_POOL_TIMEOUT_SECONDS) {
      parsed.searchParams.set("pool_timeout", String(MIN_POOL_TIMEOUT_SECONDS));
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const datasourceUrl = applyMinimumPrismaPoolSettings(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl
            }
          }
        }
      : {}),
    transactionOptions: {
      maxWait: TRANSACTION_MAX_WAIT_MS,
      timeout: TRANSACTION_TIMEOUT_MS
    }
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
