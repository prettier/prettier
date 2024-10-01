import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import fastGlob from "fast-glob";
import { runGit } from "../utils.js";

export default async function cleanChangelog({ repo }) {
  const changelogUnreleasedDir = fileURLToPath(
    new URL("../../../changelog_unreleased", import.meta.url),
  );

  const files = await fastGlob(["blog-post-intro.md", "*/*.md"], {
    cwd: changelogUnreleasedDir,
    absolute: true,
  });

  await Promise.all(files.map((file) => fs.unlink(file)));

  await runGit(["commit", "-am", "Clean changelog_unreleased"]);
  await runGit(["push", "--repo", repo]);
}
