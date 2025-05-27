import fs from "node:fs";

const nodejsMajorVersion = Number(process.versions.node.split(".")[0]);
const packageJsonFile = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

const jestVersion =
  nodejsMajorVersion === 14
    ? // `jest@30.0.0-alpha.2` is the last version that supports Node.js v14
      "30.0.0-alpha.2"
    : // `jest@30.0.0-alpha.7` is the last version that supports Node.js v16
      "30.0.0-alpha.7";

// Script to get dependencies
// console.log(
//   Object.fromEntries(
//     Array.from(
//       fs
//         .readFileSync("./yarn.lock", "utf8")
//         .matchAll(/"(.*?)@npm:30\.0\.0-alpha\.3[",]/g),
//       (match) => match[1],
//     )
//       .sort()
//       .map((dependency) => [dependency, "30.0.0-alpha.2"]),
//   ),
// );

fs.writeFileSync(
  packageJsonFile,
  JSON.stringify(
    {
      ...packageJson,
      resolutions: {
        ...packageJson.resolutions,
        "@jest/console": jestVersion,
        "@jest/core": jestVersion,
        "@jest/environment": jestVersion,
        "@jest/expect": jestVersion,
        "@jest/expect-utils": jestVersion,
        "@jest/fake-timers": jestVersion,
        "@jest/globals": jestVersion,
        "@jest/reporters": jestVersion,
        "@jest/schemas": jestVersion,
        "@jest/source-map": jestVersion,
        "@jest/test-result": jestVersion,
        "@jest/test-sequencer": jestVersion,
        "@jest/transform": jestVersion,
        // "@jest/types": jestVersion,
        "babel-jest": jestVersion,
        "babel-plugin-jest-hoist": jestVersion,
        "babel-preset-jest": jestVersion,
        "diff-sequences": jestVersion,
        expect: jestVersion,
        jest: jestVersion,
        "jest-changed-files": jestVersion,
        "jest-circus": jestVersion,
        "jest-cli": jestVersion,
        "jest-config": jestVersion,
        "jest-diff": jestVersion,
        // "jest-docblock": jestVersion,
        "jest-each": jestVersion,
        "jest-environment-node": jestVersion,
        "jest-get-type": jestVersion,
        "jest-haste-map": jestVersion,
        "jest-leak-detector": jestVersion,
        "jest-matcher-utils": jestVersion,
        "jest-message-util": jestVersion,
        "jest-mock": jestVersion,
        "jest-regex-util": jestVersion,
        "jest-resolve": jestVersion,
        "jest-resolve-dependencies": jestVersion,
        "jest-runner": jestVersion,
        "jest-runtime": jestVersion,
        "jest-snapshot": jestVersion,
        "jest-util": jestVersion,
        "jest-validate": jestVersion,
        "jest-watcher": jestVersion,
        "jest-worker": jestVersion,
        "pretty-format": jestVersion,
      },
    },
    undefined,
    2,
  ),
);
