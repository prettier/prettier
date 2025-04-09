import fs from "node:fs";

const packageJsonFile = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

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
        "@jest/console": "30.0.0-alpha.2",
        "@jest/core": "30.0.0-alpha.2",
        "@jest/environment": "30.0.0-alpha.2",
        "@jest/expect": "30.0.0-alpha.2",
        "@jest/expect-utils": "30.0.0-alpha.2",
        "@jest/fake-timers": "30.0.0-alpha.2",
        "@jest/globals": "30.0.0-alpha.2",
        "@jest/reporters": "30.0.0-alpha.2",
        "@jest/schemas": "30.0.0-alpha.2",
        "@jest/source-map": "30.0.0-alpha.2",
        "@jest/test-result": "30.0.0-alpha.2",
        "@jest/test-sequencer": "30.0.0-alpha.2",
        "@jest/transform": "30.0.0-alpha.2",
        // "@jest/types": "30.0.0-alpha.2",
        "babel-jest": "30.0.0-alpha.2",
        "babel-plugin-jest-hoist": "30.0.0-alpha.2",
        "babel-preset-jest": "30.0.0-alpha.2",
        "diff-sequences": "30.0.0-alpha.2",
        expect: "30.0.0-alpha.2",
        jest: "30.0.0-alpha.2",
        "jest-changed-files": "30.0.0-alpha.2",
        "jest-circus": "30.0.0-alpha.2",
        "jest-cli": "30.0.0-alpha.2",
        "jest-config": "30.0.0-alpha.2",
        "jest-diff": "30.0.0-alpha.2",
        // "jest-docblock": "30.0.0-alpha.2",
        "jest-each": "30.0.0-alpha.2",
        "jest-environment-node": "30.0.0-alpha.2",
        "jest-get-type": "30.0.0-alpha.2",
        "jest-haste-map": "30.0.0-alpha.2",
        "jest-leak-detector": "30.0.0-alpha.2",
        "jest-matcher-utils": "30.0.0-alpha.2",
        "jest-message-util": "30.0.0-alpha.2",
        "jest-mock": "30.0.0-alpha.2",
        "jest-regex-util": "30.0.0-alpha.2",
        "jest-resolve": "30.0.0-alpha.2",
        "jest-resolve-dependencies": "30.0.0-alpha.2",
        "jest-runner": "30.0.0-alpha.2",
        "jest-runtime": "30.0.0-alpha.2",
        "jest-snapshot": "30.0.0-alpha.2",
        "jest-util": "30.0.0-alpha.2",
        "jest-validate": "30.0.0-alpha.2",
        "jest-watcher": "30.0.0-alpha.2",
        "jest-worker": "30.0.0-alpha.2",
        "pretty-format": "30.0.0-alpha.2",
      },
    },
    undefined,
    2,
  ),
);
