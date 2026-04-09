import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";

const tempTsconfigPath = join(process.cwd(), ".tsconfig.typecheck.tmp.json");

try {
  const raw = await readFile("tsconfig.json", "utf8");
  const config = JSON.parse(raw);
  config.include = (config.include || []).filter((entry) => entry !== ".next/types/**/*.ts");
  config.compilerOptions = {
    ...(config.compilerOptions || {}),
    incremental: false,
  };

  await writeFile(tempTsconfigPath, JSON.stringify(config, null, 2));

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["exec", "tsc", "--noEmit", "-p", tempTsconfigPath], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => resolve(code ?? 1));
  });

  process.exitCode = Number(exitCode);
} finally {
  await rm(tempTsconfigPath, { force: true });
}
