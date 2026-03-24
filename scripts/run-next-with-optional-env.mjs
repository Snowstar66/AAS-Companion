import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const envFile = path.join(repoRoot, ".env.local");
const webRoot = path.join(repoRoot, "apps", "web");
const nextBin = path.join(webRoot, "node_modules", "next", "dist", "bin", "next");
const mode = process.argv[2];

if (!mode) {
  throw new Error('Usage: node scripts/run-next-with-optional-env.mjs <dev|build|start>');
}

const args = [];

if (existsSync(envFile)) {
  args.push(`--env-file=${envFile}`);
}

args.push(nextBin, mode);

if (mode === "dev" && process.env.AAS_NEXT_DISABLE_TURBOPACK !== "1") {
  args.push("--turbopack");
}

const child = spawn(process.execPath, args, {
  cwd: webRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: mode === "dev" ? "development" : "production"
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
