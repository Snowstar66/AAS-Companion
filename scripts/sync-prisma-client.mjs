import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const sourceDir = path.join(repoRoot, "packages", "db", "generated", "client");
const targetDirs = [
  path.join(repoRoot, "apps", "web", ".prisma", "client"),
  path.join(repoRoot, "apps", "web", "generated", "client")
];

function syncDirectory(targetDir) {
  mkdirSync(path.dirname(targetDir), { recursive: true });

  try {
    rmSync(targetDir, { recursive: true, force: true });
    cpSync(sourceDir, targetDir, { recursive: true });
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "EPERM") {
      throw error;
    }

    mkdirSync(targetDir, { recursive: true });

    for (const entry of readdirSync(sourceDir)) {
      const sourcePath = path.join(sourceDir, entry);
      const targetPath = path.join(targetDir, entry);

      try {
        cpSync(sourcePath, targetPath, { recursive: true, force: false });
      } catch (copyError) {
        if (!(copyError instanceof Error) || !("code" in copyError) || copyError.code !== "EEXIST") {
          throw copyError;
        }
      }
    }
  }
}

if (process.env.VERCEL === "1") {
  const result = spawnSync("pnpm", ["--filter", "@aas-companion/db", "db:generate"], {
    cwd: repoRoot,
    stdio: "inherit",
    shell: true,
    env: process.env
  });

  if (result.status !== 0) {
    throw new Error("Prisma client generation failed in the Vercel build environment.");
  }
}

if (!existsSync(sourceDir)) {
  throw new Error(
    `Prisma client not found at ${sourceDir}. Run "pnpm db:generate" or sync the generated client first.`
  );
}

for (const targetDir of targetDirs) {
  syncDirectory(targetDir);
}
