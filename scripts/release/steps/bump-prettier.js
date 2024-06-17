import fs from "node:fs";

import semver from "semver";

import { logPromise, readJson, runGit, runYarn, writeJson } from "../utils.js";

async function format() {
  await runYarn(["lint:eslint", "--fix"]);
  await runYarn(["lint:prettier", "--write"]);
}

// Only add commit to `.git-blame-ignore-revs` when files except `package.json` and `yarn.lock` changed
const IGNORED_FILES = new Set(["package.json", "yarn.lock"]);
async function shouldAddToGitBlameIgnoreRevsFile() {
  const { stdout } = await runGit(["diff", "--name-only"]);
  const changedFiles = stdout.split("\n");
  return changedFiles.some((file) => !IGNORED_FILES.has(file));
}

async function commit({ version, repo }) {
  const filesChanged = await shouldAddToGitBlameIgnoreRevsFile();

  await runGit(["commit", "-am", `Bump Prettier dependency to ${version}`]);

  // Add rev to `.git-blame-ignore-revs` file
  if (filesChanged) {
    const file = ".git-blame-ignore-revs";
    const mark = "# Prettier bump after release";
    const { stdout: rev } = await runGit(["rev-parse", "HEAD"]);
    let text = fs.readFileSync(file, "utf8");
    text = text.replace(mark, `${mark}\n# ${version}\n${rev}`);
    fs.writeFileSync(file, text);
    await runGit(["commit", "-am", `Git blame ignore ${version}`]);
  }

  await runGit(["push", "--repo", repo]);
}

async function bump({
  version,
  previousVersion,
  previousVersionOnDefaultBranch,
}) {
  const pkg = await readJson("package.json");
  if (semver.diff(version, previousVersion) === "patch") {
    pkg.version = previousVersionOnDefaultBranch; // restore the `-dev` version
  } else {
    pkg.version = semver.inc(version, "minor") + "-dev";
  }
  await writeJson("package.json", pkg);
}

export default async function bumpPrettier(params) {
  const { dry, version, next } = params;

  if (dry || next) {
    return;
  }

  /*
  This should be done before installing Prettier,
  otherwise the yarn.lock will merge `prettier@npm:<version>, prettier@workspace:.`
  */
  await logPromise("Bump default branch version", bump(params));
  await logPromise(
    "Installing Prettier",
    runYarn(["add", "--dev", `prettier@${version}`]),
  );
  await logPromise("Updating files", format());
  await logPromise("Committing changed files", commit(params));
}
