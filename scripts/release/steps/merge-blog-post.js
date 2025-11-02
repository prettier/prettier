import styleText from "node-style-text";
import semver from "semver";
import { runGit, waitForEnter } from "../utils.js";

export default async function mergeBlogPost({
  dry,
  repo,
  version,
  previousVersion,
}) {
  if (dry) {
    return;
  }

  if (semver.diff(version, previousVersion) === "patch") {
    return;
  }

  console.log(
    styleText.yellow.bold("Please merge the release notes PR if exits."),
  );

  await waitForEnter();
  await runGit(["pull", repo]);
}
