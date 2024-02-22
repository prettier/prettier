import fs from "node:fs";

const packageJsonFile = new URL("../package.json", import.meta.url);
const packageJson = JSON.parse(fs.readFileSync(packageJsonFile));

fs.writeFileSync(
  packageJsonFile,
  JSON.stringify(
    {
      ...packageJson,
      resolutions: {
        ...packageJson.resolutions,
        jest: "30.0.0-alpha.2",
        "jest-config": "30.0.0-alpha.2",
        "@jest/console": "npm:30.0.0-alpha.2",
        "@jest/environment": "npm:30.0.0-alpha.2",
        "@jest/test-result": "npm:30.0.0-alpha.2",
        "@jest/transform": "npm:30.0.0-alpha.2",
      },
    },
    undefined,
    2,
  ),
);
