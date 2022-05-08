import fs from "node:fs";
import { execa } from "execa";
import chalk from "chalk";
import outdent from "outdent";
import semver from "semver";
import {
  waitForEnter,
  runYarn,
  logPromise,
  getBlogPostInfo,
  getChangelogContent,
} from "../utils.js";

const outdentString = outdent.string;

function writeChangelog(params) {
  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  const newEntry = `# ${params.version}\n\n` + getChangelogContent(params);
  fs.writeFileSync("CHANGELOG.md", newEntry + "\n\n" + changelog);
}

async function getChangelogForPatch({ version, previousVersion }) {
  const { stdout: changelog } = await execa("node", [
    "scripts/changelog-for-patch.mjs",
    "--prev-version",
    previousVersion,
    "--new-version",
    version,
  ]);
  return changelog;
}

export default async function updateChangelog({ version, previousVersion }) {
  const semverDiff = semver.diff(version, previousVersion);

  if (semverDiff !== "patch") {
    const blogPost = getBlogPostInfo(version);
    writeChangelog({
      version,
      previousVersion,
      body: `🔗 [Release Notes](https://prettier.io/${blogPost.path})`,
    });
    if (fs.existsSync(blogPost.file)) {
      // Everything is fine, this step is finished
      return;
    }
    console.warn(
      outdentString(chalk`
        {yellow warning} The file {bold ${blogPost.file}} doesn't exist, but it will be referenced in {bold CHANGELOG.md}. Make sure to create it later.

        Press ENTER to continue.
      `)
    );
  } else {
    const body = await getChangelogForPatch({
      version,
      previousVersion,
    });
    writeChangelog({
      version,
      previousVersion,
      body,
    });
    console.log("Press ENTER to continue.");
  }

  await waitForEnter();
  await logPromise(
    "Re-running Prettier on docs",
    runYarn(["lint:prettier", "--write"])
  );
}
