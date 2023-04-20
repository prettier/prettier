import { getContextOptions } from "../../../src/cli/options/get-context-options.js";

const { detailedOptions } = await getContextOptions();

for (const option of detailedOptions) {
  const optionNames = [
    option.description ? option.name : null,
    option.oppositeDescription ? `no-${option.name}` : null,
  ].filter(Boolean);

  for (const optionName of optionNames) {
    describe(`show detailed usage with --help ${optionName}`, () => {
      runCli("cli", ["--help", optionName]).test({
        status: 0,
      });
    });
  }
}
