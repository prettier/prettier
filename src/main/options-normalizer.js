"use strict";

const vnopts = require("vnopts");
const getLast = require("../utils/get-last.js");

/**
 * @typedef {import("./support").NamedOptionInfo} NamedOptionInfo
 */

const cliDescriptor = {
  key: (key) => (key.length === 1 ? `-${key}` : `--${key}`),
  value: (value) => vnopts.apiDescriptor.value(value),
  pair: ({ key, value }) =>
    value === false
      ? `--no-${key}`
      : value === true
      ? cliDescriptor.key(key)
      : value === ""
      ? `${cliDescriptor.key(key)} without an argument`
      : `${cliDescriptor.key(key)}=${value}`,
};

// To prevent `chalk` and `leven` module from being included in the `standalone.js` bundle, it will take that as an argument if needed.
const getFlagSchema = ({ colorsModule, levenshteinDistance }) =>
  class FlagSchema extends vnopts.ChoiceSchema {
    constructor({ name, flags }) {
      super({ name, choices: flags });
      this._flags = [...flags].sort();
    }
    preprocess(value, utils) {
      if (
        typeof value === "string" &&
        value.length > 0 &&
        !this._flags.includes(value)
      ) {
        const suggestion = this._flags.find(
          (flag) => levenshteinDistance(flag, value) < 3
        );
        if (suggestion) {
          utils.logger.warn(
            [
              `Unknown flag ${colorsModule.yellow(
                utils.descriptor.value(value)
              )},`,
              `did you mean ${colorsModule.blue(
                utils.descriptor.value(suggestion)
              )}?`,
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
  };

let hasDeprecationWarned;

/**
 * @param {*} options
 * @param {*} optionInfos
 * @param {{ logger?: false; isCLI?: boolean; passThrough?: boolean; colorsModule?: any; levenshteinDistance?: any }} param2
 */
function normalizeOptions(
  options,
  optionInfos,
  {
    logger = false,
    isCLI = false,
    passThrough = false,
    colorsModule = null,
    levenshteinDistance = null,
  } = {}
) {
  const unknown = !passThrough
    ? (key, value, options) => {
        // Don't suggest `_` for unknown flags
        const { _, ...schemas } = options.schemas;
        return vnopts.levenUnknownHandler(key, value, {
          ...options,
          schemas,
        });
      }
    : Array.isArray(passThrough)
    ? (key, value) =>
        !passThrough.includes(key) ? undefined : { [key]: value }
    : (key, value) => ({ [key]: value });

  const descriptor = isCLI ? cliDescriptor : vnopts.apiDescriptor;
  const schemas = optionInfosToSchemas(optionInfos, {
    isCLI,
    colorsModule,
    levenshteinDistance,
  });
  const normalizer = new vnopts.Normalizer(schemas, {
    logger,
    unknown,
    descriptor,
  });

  const shouldSuppressDuplicateDeprecationWarnings = logger !== false;

  if (shouldSuppressDuplicateDeprecationWarnings && hasDeprecationWarned) {
    // @ts-expect-error
    normalizer._hasDeprecationWarned = hasDeprecationWarned;
  }

  const normalized = normalizer.normalize(options);

  if (shouldSuppressDuplicateDeprecationWarnings) {
    // @ts-expect-error
    hasDeprecationWarned = normalizer._hasDeprecationWarned;
  }

  if (isCLI && normalized["plugin-search"] === false) {
    normalized["plugin-search-dir"] = false;
  }

  return normalized;
}

function optionInfosToSchemas(
  optionInfos,
  { isCLI, colorsModule, levenshteinDistance }
) {
  const schemas = [];

  if (isCLI) {
    schemas.push(vnopts.AnySchema.create({ name: "_" }));
  }

  for (const optionInfo of optionInfos) {
    schemas.push(
      optionInfoToSchema(optionInfo, {
        isCLI,
        optionInfos,
        colorsModule,
        levenshteinDistance,
      })
    );

    if (optionInfo.alias && isCLI) {
      schemas.push(
        vnopts.AliasSchema.create({
          // @ts-expect-error
          name: optionInfo.alias,
          sourceName: optionInfo.name,
        })
      );
    }
  }

  return schemas;
}

/**
 * @param {NamedOptionInfo} optionInfo
 * @param {any} param1
 * @returns
 */
function optionInfoToSchema(
  optionInfo,
  { isCLI, optionInfos, colorsModule, levenshteinDistance }
) {
  const { name } = optionInfo;

  if (name === "plugin-search-dir" || name === "pluginSearchDirs") {
    return vnopts.AnySchema.create({
      // @ts-expect-error
      name,
      preprocess(value) {
        if (value === false) {
          return value;
        }
        value = Array.isArray(value) ? value : [value];
        return value;
      },
      /**
       * @param {Array<unknown> | false} value
       */
      validate(value) {
        if (value === false) {
          return true;
        }
        return value.every((dir) => typeof dir === "string");
      },
      expected() {
        return "false or paths to plugin search dir";
      },
    });
  }

  const parameters = { name };
  let SchemaConstructor;
  const handlers = {};

  switch (optionInfo.type) {
    case "int":
      SchemaConstructor = vnopts.IntegerSchema;
      if (isCLI) {
        parameters.preprocess = Number;
      }
      break;
    case "string":
      SchemaConstructor = vnopts.StringSchema;
      break;
    case "choice":
      SchemaConstructor = vnopts.ChoiceSchema;
      parameters.choices = optionInfo.choices.map((choiceInfo) =>
        typeof choiceInfo === "object" && choiceInfo.redirect
          ? {
              ...choiceInfo,
              redirect: {
                to: { key: optionInfo.name, value: choiceInfo.redirect },
              },
            }
          : choiceInfo
      );
      break;
    case "boolean":
      SchemaConstructor = vnopts.BooleanSchema;
      break;
    case "flag":
      SchemaConstructor = getFlagSchema({ colorsModule, levenshteinDistance });
      parameters.flags = optionInfos.flatMap((optionInfo) =>
        [
          optionInfo.alias,
          optionInfo.description && optionInfo.name,
          optionInfo.oppositeDescription && `no-${optionInfo.name}`,
        ].filter(Boolean)
      );
      break;
    case "path":
      SchemaConstructor = vnopts.StringSchema;
      break;
    default:
      /* istanbul ignore next */
      throw new Error(`Unexpected type ${optionInfo.type}`);
  }

  if (optionInfo.exception) {
    parameters.validate = (value, schema, utils) =>
      optionInfo.exception(value) || schema.validate(value, utils);
  } else {
    parameters.validate = (value, schema, utils) =>
      value === undefined || schema.validate(value, utils);
  }

  /* istanbul ignore next */
  if (optionInfo.redirect) {
    handlers.redirect = (value) =>
      !value
        ? undefined
        : {
            to: {
              key: optionInfo.redirect.option,
              value: optionInfo.redirect.value,
            },
          };
  }

  /* istanbul ignore next */
  if (optionInfo.deprecated) {
    handlers.deprecated = true;
  }

  // allow CLI overriding, e.g., prettier package.json --tab-width 1 --tab-width 2
  if (isCLI && !optionInfo.array) {
    const originalPreprocess = parameters.preprocess || ((x) => x);
    parameters.preprocess = (value, schema, utils) =>
      schema.preprocess(
        originalPreprocess(Array.isArray(value) ? getLast(value) : value),
        utils
      );
  }

  return optionInfo.array
    ? vnopts.ArraySchema.create({
        ...(isCLI ? { preprocess: (v) => (Array.isArray(v) ? v : [v]) } : {}),
        ...handlers,
        // @ts-expect-error
        valueSchema: SchemaConstructor.create(parameters),
      })
    : SchemaConstructor.create({ ...parameters, ...handlers });
}

function normalizeApiOptions(options, optionInfos, opts) {
  return normalizeOptions(options, optionInfos, opts);
}

function normalizeCliOptions(options, optionInfos, opts) {
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== "production") {
    if (!opts.colorsModule) {
      throw new Error("'colorsModule' option is required.");
    }

    if (!opts.levenshteinDistance) {
      throw new Error("'levenshteinDistance' option is required.");
    }
  }

  return normalizeOptions(options, optionInfos, { isCLI: true, ...opts });
}

module.exports = {
  normalizeApiOptions,
  normalizeCliOptions,
};
