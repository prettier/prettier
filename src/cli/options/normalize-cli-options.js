import chalk from "chalk";
import leven from "leven";
import vnopts from "vnopts";
import { normalizeCliOptions as prettierNormalizeCliOptions } from "../prettier-internal.js";

function normalizeCliOptions(options, optionInfos, opts) {
  return prettierNormalizeCliOptions(options, optionInfos, {
    isCLI: true,
    FlagSchema,
    ...opts,
  });
}

class FlagSchema extends vnopts.ChoiceSchema {
  #flags = [];

  constructor({ name, flags }) {
    super({ name, choices: flags });
    this.#flags = [...flags].sort();
  }
  preprocess(value, utils) {
    if (
      typeof value === "string" &&
      value.length > 0 &&
      !this.#flags.includes(value)
    ) {
      const suggestion = this.#flags.find((flag) => leven(flag, value) < 3);
      if (suggestion) {
        utils.logger.warn(
          [
            `Unknown flag ${chalk.yellow(utils.descriptor.value(value))},`,
            `did you mean ${chalk.blue(utils.descriptor.value(suggestion))}?`,
          ].join(" ")
        );
        return suggestion;
      }
    }
    return value;
  }
  expected() {
    return "a flag";
  }
}

export default normalizeCliOptions;
