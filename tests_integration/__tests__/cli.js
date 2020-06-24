"use strict";
const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { prettierCli, isProduction, prettierRootDir } = require("../env");

describe("CLI", () => {
  test("CLI should be executable.", () => {
    expect(() => fs.accessSync(prettierCli, fs.constants.X_OK)).not.toThrow();
  });
});

if (isProduction) {
  test("prefer local installation", async () => {
    const packageJson = require(path.join(prettierRootDir, "package.json"));
    const workingDirectory = path.join(prettierRootDir, "../..");

    // copy bin file
    const binFilename = path.basename(prettierCli);
    const binFile = path.join(workingDirectory, binFilename);
    fs.writeFileSync(fs.readFileSync(prettierCli));

    // write package.json
    const packageJsonFile = path.join(workingDirectory, "package.json");
    fs.writeFileSync(
      packageJsonFile,
      JSON.stringify({
        ...packageJson,
        version: "global",
      })
    );

    expect(
      (await execa(`node ${binFilename} --version`).stdout, { cwd: workingDirectory })
    ).toBe(packageJson.version);
  });
}
