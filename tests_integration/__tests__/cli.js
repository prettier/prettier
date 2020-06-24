"use strict";
const fs = require("fs");
const path = require("path");
const execa = require("execa");
const { prettierCli, isProduction, prettierRootDir } = require("../env");

describe("CLI", () => {
  test("CLI should be executable.", () => {
    expect(() => fs.accessSync(prettierCli, fs.constants.X_OK)).not.toThrow();
  });

  const packageJson = require(path.join(prettierRootDir, "package.json"));
  const version = packageJson.version;

  test("CLI version should read from `package.json`.", () => {
    const randomVersion = version + Math.random();

    fs.writeFileSync(
      packageJsonFile,
      JSON.stringify({
        ...packageJson,
        version: randomVersion,
      })
    );

    const actualVersion = (await execa(`node ${prettierCli} --version`, { cwd: prettierRootDir })).stdout

    fs.writeFileSync(
      packageJsonFile,
      JSON.stringify({
        ...packageJson,
        version,
      })
    );

    expect(actualVersion).toBe(randomVersion);
  });

  if (isProduction) {
    test("prefer local installation", async () => {
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
        (await execa.sync(`node ${binFile} --version`, { cwd: prettierRootDir })).stdout
      ).toBe(version);
    });
  }

});
