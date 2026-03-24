import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const tscBin = path.join(repoRoot, "node_modules", "typescript", "bin", "tsc");

const packages = [
  { name: "@aas-companion/config", dir: "packages/config" },
  { name: "@aas-companion/domain", dir: "packages/domain" },
  { name: "@aas-companion/ui", dir: "packages/ui" },
  { name: "@aas-companion/db", dir: "packages/db" },
  { name: "@aas-companion/api", dir: "packages/api" }
];

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Command terminated by signal ${signal}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
        return;
      }

      resolve();
    });

    child.on("error", reject);
  });
}

for (const pkg of packages) {
  const packageRoot = path.join(repoRoot, pkg.dir);
  const distDir = path.join(packageRoot, "dist");
  const tsconfigPath = path.join(packageRoot, "tsconfig.json");
  const tsBuildInfoFile = path.join(distDir, ".tsbuildinfo");

  await run(
    process.execPath,
    [
      tscBin,
      "--project",
      tsconfigPath,
      "--outDir",
      distDir,
      "--declaration",
      "--declarationMap",
      "false",
      "--sourceMap",
      "false",
      "--incremental",
      "--tsBuildInfoFile",
      tsBuildInfoFile
    ],
    repoRoot
  );
}
