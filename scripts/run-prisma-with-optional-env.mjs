import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const envFile = path.join(repoRoot, ".env.local");
const prismaCli = path.join(repoRoot, "packages", "db", "node_modules", "prisma", "build", "index.js");
const schemaPath = path.join(repoRoot, "packages", "db", "prisma", "schema.prisma");
const argsFromUser = process.argv.slice(2);

if (argsFromUser.length === 0) {
  throw new Error('Usage: node scripts/run-prisma-with-optional-env.mjs <command...>');
}

const args = [];

if (existsSync(envFile)) {
  args.push(`--env-file=${envFile}`);
}

args.push(prismaCli, ...argsFromUser, "--schema", schemaPath);

const child = spawn(process.execPath, args, {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
