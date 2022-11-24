import { runGit, logPromise } from "../utils.js";

async function pushGit({ version, repo }) {
  await runGit(["commit", "-am", `Release ${version}`]);
  await runGit(["tag", "-a", version, "-m", `Release ${version}`]);
  await runGit(["push", "--repo", repo]);
  await runGit(["push", "--tags", "--repo", repo]);
}

export default function pushToGit(params) {
  if (params.dry) {
    return;
  }

  return logPromise("Committing and pushing to remote", pushGit(params));
}
