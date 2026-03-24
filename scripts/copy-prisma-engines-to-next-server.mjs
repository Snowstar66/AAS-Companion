import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const sourceDir = path.join(repoRoot, "apps", "web", "generated", "client");
const nextServerDir = path.join(repoRoot, "apps", "web", ".next", "server");

if (!existsSync(sourceDir) || !existsSync(nextServerDir)) {
  process.exit(0);
}

mkdirSync(nextServerDir, { recursive: true });

for (const entry of readdirSync(sourceDir)) {
  if (
    entry.startsWith("libquery_engine-") ||
    entry.startsWith("query_engine-") ||
    entry === "schema.prisma"
  ) {
    cpSync(path.join(sourceDir, entry), path.join(nextServerDir, entry), { force: true });
  }
}
