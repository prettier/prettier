import {
  leven,
  normalizeOptions,
  picocolors,
  vnopts,
} from "../prettier-internal.js";

const descriptor = {
  key: (key) => (key.length === 1 ? `-${key}` : `--${key}`),
  value: (value) => vnopts.apiDescriptor.value(value),
  pair: ({ key, value }) =>
    value === false
      ? `--no-${key}`
      : value === true
        ? descriptor.key(key)
        : value === ""
          ? `${descriptor.key(key)} without an argument`
          : `${descriptor.key(key)}=${value}`,
};

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
            `Unknown flag ${picocolors.yellow(utils.descriptor.value(value))},`,
            `did you mean ${picocolors.blue(utils.descriptor.value(suggestion))}?`,
          ].join(" "),
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

function normalizeCliOptions(options, optionInfos, opts) {
  return normalizeOptions(options, optionInfos, {
    ...opts,
    isCLI: true,
    FlagSchema,
    descriptor,
  });
}

export default normalizeCliOptions;
