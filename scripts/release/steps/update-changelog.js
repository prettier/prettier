import fs from "node:fs";
import spawn from "nano-spawn";
import styleText from "node-style-text";
import semver from "semver";
import {
  getBlogPostInfo,
  getChangelogContent,
  logPromise,
  runYarn,
  waitForEnter,
} from "../utils.js";

function writeChangelog(params) {
  const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
  const newEntry = `# ${params.version}\n\n` + getChangelogContent(params);
  fs.writeFileSync("CHANGELOG.md", newEntry + "\n\n" + changelog);
}

async function getChangelogForPatch({ version, previousVersion }) {
  const { stdout: changelog } = await spawn(process.execPath, [
    "scripts/changelog-for-patch.js",
    "--prev-version",
    previousVersion,
    "--new-version",
    version,
  ]);
  return changelog;
}

export default async function updateChangelog({
  dry,
  version,
  previousVersion,
  next,
}) {
  if (dry || next) {
    return;
  }

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
      `${styleText.yellow("warning")} The file ${styleText.bold(
        blogPost.file,
      )} doesn't exist, but it will be referenced in ${styleText.bold(
        "CHANGELOG.md",
      )}. Make sure to create it later.`,
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
  }

  await waitForEnter();
  await logPromise(
    "Re-running Prettier on docs",
    runYarn(["lint:prettier", "--write"]),
  );
}
