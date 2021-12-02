import prettier from "prettier-local";
import runPrettier from "../runPrettier.js";
import constant from "../../../src/cli/constant.js";
import core from "../../../src/cli/core.js";
import arrayify from "../../../src/utils/arrayify.js";

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
