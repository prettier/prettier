"use strict";

const prettier = require("prettier-local");
const runPrettier = require("../runPrettier");
const constant = require("../../../src/cli/constant");
const core = require("../../../src/cli/core");
const arrayify = require("../../../src/utils/arrayify");

for (const option of arrayify(
  {
    ...core.createDetailedOptionMap(
      prettier.getSupportInfo({
        showDeprecated: true,
        showUnreleased: true,
        showInternal: true,
      }).options
    ),
    ...core.normalizeDetailedOptionMap(constant.options),
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
