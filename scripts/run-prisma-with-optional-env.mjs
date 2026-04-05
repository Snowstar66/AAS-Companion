import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const envFile = path.join(repoRoot, ".env.local");
const prismaCli = path.join(repoRoot, "packages", "db", "node_modules", "prisma", "build", "index.js");
const schemaPath = path.join(repoRoot, "packages", "db", "prisma", "schema.prisma");
const argsFromUser = process.argv.slice(2);

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((accumulator, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return accumulator;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      accumulator[key] = value;
      return accumulator;
    }, {});
}

if (argsFromUser.length === 0) {
  throw new Error('Usage: node scripts/run-prisma-with-optional-env.mjs <command...>');
}

const args = [];

if (existsSync(envFile)) {
  args.push(`--env-file=${envFile}`);
}

args.push(prismaCli, ...argsFromUser, "--schema", schemaPath);

const envFromFile = parseEnvFile(envFile);
const mergedEnv = {
  ...envFromFile,
  ...process.env
};

if (!mergedEnv.DIRECT_URL?.trim() && mergedEnv.DATABASE_URL?.trim()) {
  mergedEnv.DIRECT_URL = mergedEnv.DATABASE_URL.trim();
}

const child = spawn(process.execPath, args, {
  cwd: repoRoot,
  stdio: "inherit",
  env: mergedEnv
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
