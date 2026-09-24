import styleText from "node-style-text";
import * as verkit from "verkit";
import { runGit, waitForEnter } from "../utilities.js";

export default async function mergeBlogPost({
  dry,
  repo,
  version,
  previousVersion,
}) {
  if (dry) {
    return;
  }

  if (verkit.difference(version, previousVersion) === "patch") {
    return;
  }

  console.log(
    styleText.yellow.bold("Please merge the release notes PR if exits."),
  );

  await waitForEnter();
  await runGit(["pull", "--repo", repo]);
}
