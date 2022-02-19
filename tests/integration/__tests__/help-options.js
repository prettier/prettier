"use strict";

const prettier = require("prettier-local");
const runPrettier = require("../run-prettier.js");
const constant = require("../../../src/cli/constant.js");
const {
  createDetailedOptionMap,
  normalizeDetailedOptionMap,
} = require("../../../src/cli/options/option-map.js");
const arrayify = require("../../../src/utils/arrayify.js");

for (const option of arrayify(
  {
    ...createDetailedOptionMap(
      prettier.getSupportInfo({
        showDeprecated: true,
        showUnreleased: true,
        showInternal: true,
      }).options
    ),
    ...normalizeDetailedOptionMap(constant.options),
  },
  "name"
)) {
  const optionNames = [
    option.description ? option.name : null,
    option.oppositeDescription ? `no-${option.name}` : null,
  ].filter(Boolean);

  for (const optionName of optionNames) {
    describe(`show detailed usage with --help ${optionName}`, () => {
      runPrettier("cli", ["--help", optionName]).test({
        status: 0,
      });
    });
  }
}
