import chalk from "chalk";
import semver from "semver";

export default function validateNewVersion({ version, previousVersion }) {
  if (!semver.valid(version)) {
    throw new Error("Invalid version specified");
  }

  if (!semver.gt(version, previousVersion)) {
    throw new Error(
      `Version ${chalk.yellow(version)} has already been published`
    );
  }
}
