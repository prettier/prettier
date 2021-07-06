"use strict";

const prettier = require("prettier-local");
const runPrettier = require("../runPrettier");

test("API getSupportInfo()", () => {
  expect(getCoreInfo()).toMatchSnapshot();
});

describe("CLI --support-info", () => {
  runPrettier("cli", "--support-info").test({ status: 0 });
});

function getCoreInfo() {
  const supportInfo = prettier.getSupportInfo();
  const languages = Object.fromEntries(
    supportInfo.languages.map(({ name, parsers }) => [name, parsers])
  );

  const options = Object.fromEntries(
    supportInfo.options.map((option) => [
      option.name,
      {
        type: option.type,
        default: option.default,
        ...(option.type === "int"
          ? { range: option.range }
          : option.type === "choice"
          ? { choices: option.choices.map((choice) => choice.value) }
          : null),
      },
    ])
  );

  return { languages, options };
}
