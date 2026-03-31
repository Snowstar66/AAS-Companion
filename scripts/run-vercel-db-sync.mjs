import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const directUrl = process.env.DIRECT_URL?.trim() ?? "";
const isSupabasePoolerUrl = /pooler\.supabase\.com/i.test(databaseUrl);

if (!databaseUrl) {
  console.log("Skipping Prisma db push during Vercel build because DATABASE_URL is not set.");
  process.exit(0);
}

if (isSupabasePoolerUrl && !directUrl) {
  console.log(
    "Skipping Prisma db push during Vercel build because DATABASE_URL points to a Supabase pooler URL and DIRECT_URL is not set."
  );
  console.log("Set DIRECT_URL to the direct Postgres connection string if you want schema sync to run during deploy.");
  process.exit(0);
}

const child = spawn(process.execPath, [path.join(repoRoot, "scripts", "run-prisma-with-optional-env.mjs"), "db", "push"], {
  cwd: repoRoot,
  env: process.env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
