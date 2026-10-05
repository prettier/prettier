import enquirer from "enquirer";
import * as verkit from "verkit";

const SEMVER_INCREMENTS = ["patch", "minor", "major"];
const CUSTOM_VERSION_VALUE_PLACEHOLDER = "custom-version";

export default async function chooseVersion(params) {
  let version = await new enquirer.Select({
    name: "version",
    message: `Choose a version to release (current: ${params.previousVersion})`,
    choices: [
      ...SEMVER_INCREMENTS.map((type) => {
        const version = verkit.increment(params.previousVersion, type);

        return {
          message: `${type}: ${version}`,
          value: version,
        };
      }),
      { role: "separator" },
      { message: "Other", value: CUSTOM_VERSION_VALUE_PLACEHOLDER },
    ],
  }).run();

  if (version === CUSTOM_VERSION_VALUE_PLACEHOLDER) {
    ({ version } = await enquirer.prompt({
      type: "input",
      name: "version",
      message: `Input version (current: ${params.previousVersion})`,
    }));
  }

  params.version = version;
}
