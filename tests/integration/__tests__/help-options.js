import prettier from "prettier-local";
import runPrettier from "../run-prettier.js";
import * as constant from "../../../src/cli/constant.js";
import arrayify from "../../../src/utils/arrayify.js";
import {
  createDetailedOptionMap,
  normalizeDetailedOptionMap,
} from "../../../src/cli/options/option-map.js";

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
