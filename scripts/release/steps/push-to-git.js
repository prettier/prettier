import { runGit, logPromise } from "../utils.js";

async function pushGit({ version }) {
  await runGit(["commit", "-am", `Release ${version}`]);
  await runGit(["tag", "-a", version, "-m", `Release ${version}`]);
  await runGit(["push"]);
  await runGit(["push", "--tags"]);
}

export default function pushToGit(params) {
  if (params.dry) {
    return;
  }

  return logPromise("Committing and pushing to remote", pushGit(params));
}
