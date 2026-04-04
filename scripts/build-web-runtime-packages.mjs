import { mkdirSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const packages = [
  { name: "@aas-companion/config", dir: "packages/config" },
  { name: "@aas-companion/domain", dir: "packages/domain" },
  { name: "@aas-companion/ui", dir: "packages/ui" },
  { name: "@aas-companion/db", dir: "packages/db" },
  { name: "@aas-companion/api", dir: "packages/api" }
];

function run(command, args, cwd, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: process.platform === "win32" && command !== process.execPath
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr?.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${label} terminated by signal ${signal}`));
        return;
      }

      if (code !== 0) {
        const diagnosticTail = `${stdout}\n${stderr}`
          .split(/\r?\n/)
          .map((line) => line.trimEnd())
          .filter(Boolean)
          .slice(-40)
          .join("\n");
        reject(
          new Error(
            diagnosticTail
              ? `${label} failed with exit code ${code}\n--- recent output ---\n${diagnosticTail}`
              : `${label} failed with exit code ${code}`
          )
        );
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

  console.log(`\n[build:web-runtime-packages] Building ${pkg.name}...`);
  rmSync(distDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  mkdirSync(distDir, { recursive: true });

  if (process.platform === "win32") {
    await run(
      "pnpm",
      [
        "exec",
        "tsc",
        "--project",
        "tsconfig.json",
        "--outDir",
        "dist",
        "--declaration",
        "--declarationMap",
        "false",
        "--sourceMap",
        "false",
        "--incremental",
        "false"
      ],
      packageRoot,
      `[build:web-runtime-packages] ${pkg.name}`
    );
  } else {
    await run(
      "pnpm",
      [
        "exec",
        "tsc",
        "--project",
        "tsconfig.json",
        "--outDir",
        "dist",
        "--declaration",
        "--declarationMap",
        "false",
        "--sourceMap",
        "false",
        "--incremental",
        "false"
      ],
      packageRoot,
      `[build:web-runtime-packages] ${pkg.name}`
    );
  }
}
