import assert from "node:assert/strict";
import fs from "node:fs";

const packageJsonFile = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

const argv = process.argv.slice(2);
/** @type {14 | 16} */
const nodeVersion = Number(argv[1]);

assert.ok(
  argv[0] === "--node-version" && Number.isSafeInteger(nodeVersion),
  "Expect `--node-version` argument.",
);

assert.ok(
  nodeVersion === 14 || nodeVersion === 16,
  "Unexpected `--node-version`.",
);

/*
Script to get dependencies

```js
console.log(
  Array.from(
    fs
      .readFileSync("./yarn.lock", "utf8")
      .matchAll(/"(.*?)@npm:30\.0\.0-alpha\.3[",]/g),
    (match) => match[1],
  ).sort(),
);
```
*/

const jestDependencies = [
  "@jest/console",
  "@jest/core",
  "@jest/environment",
  "@jest/expect",
  "@jest/expect-utils",
  "@jest/fake-timers",
  "@jest/globals",
  "@jest/reporters",
  "@jest/schemas",
  "@jest/source-map",
  "@jest/test-result",
  "@jest/test-sequencer",
  "@jest/transform",
  // "@jest/types",
  "babel-jest",
  "babel-plugin-jest-hoist",
  "babel-preset-jest",
  "diff-sequences",
  "expect",
  "jest",
  "jest-changed-files",
  "jest-circus",
  "jest-cli",
  "jest-config",
  "jest-diff",
  // "jest-docblock",
  "jest-each",
  "jest-environment-node",
  "jest-get-type",
  "jest-haste-map",
  "jest-leak-detector",
  "jest-matcher-utils",
  "jest-message-util",
  "jest-mock",
  "jest-regex-util",
  "jest-resolve",
  "jest-resolve-dependencies",
  "jest-runner",
  "jest-runtime",
  "jest-snapshot",
  "jest-util",
  "jest-validate",
  "jest-watcher",
  "jest-worker",
  "pretty-format",
];

const jestVersion =
  nodeVersion === 14
    ? // `jest@30.0.0-alpha.2` is the last version that supports Node.js v14
      "30.0.0-alpha.2"
    : // `jest@30.0.0-alpha.7` is the last version that supports Node.js v16
      "30.0.0-alpha.7";

packageJson.resolutions = {
  ...packageJson.resolutions,
  ...Object.fromEntries(jestDependencies.map((name) => [name, jestVersion])),
};
packageJson.devDependencies["jest-light-runner"] = "0.7.13";

const content = JSON.stringify(packageJson, undefined, 2);

fs.writeFileSync(packageJsonFile, content);
