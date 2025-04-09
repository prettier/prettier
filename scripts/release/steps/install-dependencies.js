import fs from "node:fs/promises";
import { runGit, runYarn } from "../utils.js";

const PROJECT_ROOT = new URL("../../../", import.meta.url);

async function installDependenciesInDirectory(directory) {
  await fs.rm(new URL("./node_modules/", directory), {
    recursive: true,
    force: true,
  });
  await runYarn("install", { cwd: directory });
}

export default async function installDependencies() {
  await Promise.all(
    [PROJECT_ROOT, new URL("./website/", PROJECT_ROOT)].map((directory) =>
      installDependenciesInDirectory(directory),
    ),
  );

  const { stdout: status } = await runGit(["ls-files", "-m"]);
  if (status) {
    throw new Error(
      "The lockfile needs to be updated, commit it before making the release.",
    );
  }
}
