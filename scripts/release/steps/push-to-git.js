import { runGit } from "../utilities.js";

export default async function pushToGit({ version, repo }) {
  await runGit(["commit", "-am", `Release ${version}`]);
  await runGit(["tag", "-a", version, "-m", `Release ${version}`]);
  await runGit(["push", "--repo", repo]);
  await runGit(["push", "--tags", "--repo", repo]);
}
