"use strict";

const prettier = require("prettier/local");
const runPrettier = require("../runPrettier");
const snapshotDiff = require("snapshot-diff");

describe("API getSupportInfo()", () => {
  const testVersions = [
    "0.0.0",
    "1.0.0",
    "1.4.0",
    "1.5.0",
    "1.7.1",
    "1.8.0",
    "1.8.2",
    undefined
  ];

  testVersions.forEach((version, index) => {
    const info = getCoreInfo(version);
    if (index === 0) {
      test(`with version ${version}`, () => {
        expect(info).toMatchSnapshot();
      });
    } else {
      const previousVersion = testVersions[index - 1];
      const previousInfo = getCoreInfo(previousVersion);
      test(`with version ${previousVersion} -> ${version}`, () => {
        expect(snapshotDiff(previousInfo, info)).toMatchSnapshot();
      });
    }
  });
});

describe("CLI --support-info", () => {
  runPrettier("cli", "--support-info").test({ status: 0 });
});

function getCoreInfo(version) {
  const supportInfo = prettier.getSupportInfo(version);
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
