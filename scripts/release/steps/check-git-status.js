import { runGit } from "../utils.js";

export default async function checkGitStatus({ next }) {
  const { stdout: status } = await runGit(["status", "--porcelain"]);

  if (status) {
    throw new Error(
      "Uncommitted local changes. " +
        "Please revert or commit all local changes before making a release.",
    );
  }

  if (next) {
    const { stdout: branch } = await runGit(["branch", "--show-current"]);
    if (branch !== "next") {
      throw new Error(
        `Expected to be on "next" branch, but currently on "${branch}"`,
      );
    }
  }
}
