import chalk from "chalk";
import semver from "semver";

export default function validateNewVersion({ version, previousVersion }) {
  if (!version) {
    throw new Error("'--version' is required");
  }

  if (!semver.valid(version)) {
    throw new Error(
      `Invalid version '${chalk.red.underline(version)}' specified`,
    );
  }

  if (!semver.gt(version, previousVersion)) {
    throw new Error(
      `Version '${chalk.yellow.underline(version)}' has already been published`,
    );
  }
}
