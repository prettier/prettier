"use strict";

const prettier = require("../../tests_config/require_prettier");
const runPrettier = require("../runPrettier");

describe("API getSupportInfo()", () => {
  test("no arguments", () => {
    expect(prettier.getSupportInfo()).toMatchSnapshot();
  });

  const testVersions = ["0.0.0", "1.0.0", "1.4.0", "1.5.0", "1.7.1", "1.8.0"];

  testVersions.forEach(version => {
    test(`with version ${version}`, () => {
      expect(
        prettier
          .getSupportInfo(version)
          .languages.reduce(
            (obj, language) =>
              Object.assign({ [language.name]: language.parsers }, obj),
            {}
          )
      ).toMatchSnapshot();
    });
  });
});

describe("CLI --support-info", () => {
  runPrettier("cli", "--support-info").test({ status: 0 });
});
