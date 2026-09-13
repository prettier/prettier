import styleText from "node-style-text";
import * as verkit from "verkit";

export default function validateNewVersion({ version, previousVersion, next }) {
  if (!version) {
    throw new Error("'--version' is required");
  }

  if (!verkit.isValid(version)) {
    throw new Error(
      `Invalid version '${styleText.red.underline(version)}' specified`,
    );
  }

  if (!verkit.isGreater(version, previousVersion)) {
    throw new Error(
      `Version '${styleText.yellow.underline(version)}' has already been published`,
    );
  }

  if (next && !verkit.isPrerelease(version)) {
    throw new Error(
      `Version '${styleText.yellow.underline(
        version,
      )}' is not a prerelease version`,
    );
  }
}
