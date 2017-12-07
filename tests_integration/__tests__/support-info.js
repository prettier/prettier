"use strict";

const prettier = require("../../tests_config/require_prettier");
const runPrettier = require("../runPrettier");

describe("API getSupportInfo()", () => {
  test("no arguments", () => {
    expect(getCoreInfo(prettier.getSupportInfo())).toMatchSnapshot();
  });

  const testVersions = ["0.0.0", "1.0.0", "1.4.0", "1.5.0", "1.7.1", "1.8.0"];

  testVersions.forEach(version => {
    test(`with version ${version}`, () => {
      expect(getCoreInfo(prettier.getSupportInfo(version))).toMatchSnapshot();
    });
  });
});

describe("CLI --support-info", () => {
  runPrettier("cli", "--support-info").test({ status: 0 });
});

function getCoreInfo(supportInfo) {
  const languages = supportInfo.languages.reduce(
    (obj, language) =>
      Object.assign({ [language.name]: language.parsers }, obj),
    {}
  );
  const options = supportInfo.options.reduce(
    (obj, option) =>
      Object.assign(
        {
          [option.name]: Object.assign(
            {
              type: option.type,
              default: option.default
            },
            option.type === "int"
              ? { range: option.range }
              : option.type === "choice"
                ? { choices: option.choices.map(choice => choice.value) }
                : null
          )
        },
        obj
      ),
    {}
  );
  return { languages, options };
}
