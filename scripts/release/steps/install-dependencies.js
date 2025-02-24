import spawn from "nano-spawn";
import { runGit, runYarn } from "../utils.js";

export default async function installDependencies() {
  await spawn("rm", ["-rf", "node_modules"]);
  await runYarn(["install"]);

  await spawn("rm", ["-rf", "node_modules"], { cwd: "./website" });
  await runYarn(["install"], { cwd: "./website" });

  const { stdout: status } = await runGit(["ls-files", "-m"]);
  if (status) {
    throw new Error(
      "The lockfile needs to be updated, commit it before making the release.",
    );
  }
}
