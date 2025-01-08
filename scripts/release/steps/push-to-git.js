import { runGit } from "../utils.js";

export default async function pushToGit({ version, repo }) {
  await runGit(["commit", "-am", `Release v${version}`]);
  await runGit(["tag", "-a", `v${version}`, "-m", `Release v${version}`]);
  await runGit(["push", "--repo", repo]);
  await runGit(["push", "--tags", "--repo", repo]);
}
