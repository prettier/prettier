import styleText from "node-style-text";
import semver from "semver";

export default function validateNewVersion({ version, previousVersion, next }) {
  if (!version) {
    throw new Error("'--version' is required");
  }

  if (!semver.valid(version)) {
    throw new Error(
      `Invalid version '${styleText.red.underline(version)}' specified`,
    );
  }

  if (!semver.gt(version, previousVersion)) {
    throw new Error(
      `Version '${styleText.yellow.underline(version)}' has already been published`,
    );
  }

  if (next && semver.prerelease(version) === null) {
    throw new Error(
      `Version '${styleText.yellow.underline(
        version,
      )}' is not a prerelease version`,
    );
  }
}
