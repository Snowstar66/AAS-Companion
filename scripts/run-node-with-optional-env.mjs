import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const envFile = path.join(repoRoot, ".env.local");
const argsFromUser = process.argv.slice(2);

if (argsFromUser.length === 0) {
  throw new Error('Usage: node scripts/run-node-with-optional-env.mjs <script> [...args]');
}

const args = [];

if (existsSync(envFile)) {
  args.push(`--env-file=${envFile}`);
}

args.push(...argsFromUser);

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
