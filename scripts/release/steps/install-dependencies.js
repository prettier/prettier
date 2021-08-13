import execa from "execa";
import { runYarn, runGit, logPromise } from "../utils.js";

async function install() {
  await execa("rm", ["-rf", "node_modules"]);
  await runYarn(["install"]);

  const { stdout: status } = await runGit(["ls-files", "-m"]);
  if (status) {
    throw new Error(
      "The lockfile needs to be updated, commit it before making the release."
    );
  }
}

export default function () {
  return logPromise("Installing NPM dependencies", install());
}
