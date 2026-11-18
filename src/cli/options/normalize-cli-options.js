import {
  closetLevenshteinMatch,
  normalizeOptions,
  optionInfoToSchema,
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
      const suggestion = closetLevenshteinMatch(value, this.#flags, {
        maxDistance: 3,
      });
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
    schemaFactory: optionInfosToSchemas,
    descriptor,
    unknownHandler(key, value, options) {
      // Do not suggest the positional-argument schema as a flag.
      const { _, ...schemas } = options.schemas;
      return vnopts.levenUnknownHandler(key, value, { ...options, schemas });
    },
  });
}

function optionInfosToSchemas(optionInfos) {
  const schemas = [vnopts.AnySchema.create({ name: "_" })];
  const flags = optionInfos.flatMap((optionInfo) =>
    [
      optionInfo.alias,
      optionInfo.description && optionInfo.name,
      optionInfo.oppositeDescription && `no-${optionInfo.name}`,
    ].filter(Boolean),
  );

  for (const optionInfo of optionInfos) {
    const parameters = {};
    if (optionInfo.type === "int") {
      parameters.preprocess = Number;
    }
    if (optionInfo.type === "flag") {
      parameters.flags = flags;
    }
    // Repeated scalar flags use the last value, while array flags accumulate.
    if (!optionInfo.array) {
      const preprocess = parameters.preprocess ?? ((value) => value);
      parameters.preprocess = (value, schema, utils) =>
        schema.preprocess(
          preprocess(Array.isArray(value) ? value.at(-1) : value),
          utils,
        );
    }
    schemas.push(
      optionInfoToSchema(optionInfo, {
        SchemaConstructor: optionInfo.type === "flag" ? FlagSchema : undefined,
        parameters,
        arrayPreprocess: (value) => (Array.isArray(value) ? value : [value]),
      }),
    );
    if (optionInfo.alias) {
      schemas.push(
        vnopts.AliasSchema.create({
          name: optionInfo.alias,
          sourceName: optionInfo.name,
        }),
      );
    }
  }
  return schemas;
}

export default normalizeCliOptions;
