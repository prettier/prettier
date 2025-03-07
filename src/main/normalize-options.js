import * as vnopts from "vnopts";

/**
 * @import {NamedOptionInfo} from "./support.js"
 */

let hasDeprecationWarned;

/**
 * @param {*} options
 * @param {*} optionInfos
 * @param {{ logger?: false; isCLI?: boolean; passThrough?: string[] | boolean; FlagSchema?: any; descriptor?: any }} param2
 */
function normalizeOptions(
  options,
  optionInfos,
  {
    logger = false,
    isCLI = false,
    passThrough = false,
    FlagSchema,
    descriptor,
  } = {},
) {
  // TODO: Move CLI related part into `/src/cli`
  if (isCLI) {
    /* c8 ignore start */
    if (!FlagSchema) {
      throw new Error("'FlagSchema' option is required.");
    }

    if (!descriptor) {
      throw new Error("'descriptor' option is required.");
    }
    /* c8 ignore stop */
  } else {
    descriptor = vnopts.apiDescriptor;
  }

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

  const schemas = optionInfosToSchemas(optionInfos, { isCLI, FlagSchema });
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

  return normalized;
}

function optionInfosToSchemas(optionInfos, { isCLI, FlagSchema }) {
  const schemas = [];

  if (isCLI) {
    schemas.push(vnopts.AnySchema.create({ name: "_" }));
  }

  for (const optionInfo of optionInfos) {
    schemas.push(
      optionInfoToSchema(optionInfo, {
        isCLI,
        optionInfos,
        FlagSchema,
      }),
    );

    if (optionInfo.alias && isCLI) {
      schemas.push(
        vnopts.AliasSchema.create({
          // @ts-expect-error
          name: optionInfo.alias,
          sourceName: optionInfo.name,
        }),
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
function optionInfoToSchema(optionInfo, { isCLI, optionInfos, FlagSchema }) {
  const { name } = optionInfo;

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
        choiceInfo?.redirect
          ? {
              ...choiceInfo,
              redirect: {
                to: { key: optionInfo.name, value: choiceInfo.redirect },
              },
            }
          : choiceInfo,
      );
      break;
    case "boolean":
      SchemaConstructor = vnopts.BooleanSchema;
      break;
    case "flag":
      // Only available when normalizing CLI options
      SchemaConstructor = FlagSchema;
      parameters.flags = optionInfos.flatMap((optionInfo) =>
        [
          optionInfo.alias,
          optionInfo.description && optionInfo.name,
          optionInfo.oppositeDescription && `no-${optionInfo.name}`,
        ].filter(Boolean),
      );
      break;
    case "path":
      SchemaConstructor = vnopts.StringSchema;
      break;
    default:
      /* c8 ignore next */
      throw new Error(`Unexpected type ${optionInfo.type}`);
  }

  if (optionInfo.exception) {
    parameters.validate = (value, schema, utils) =>
      optionInfo.exception(value) || schema.validate(value, utils);
  } else {
    parameters.validate = (value, schema, utils) =>
      value === undefined || schema.validate(value, utils);
  }

  /* c8 ignore start */
  if (optionInfo.redirect) {
    handlers.redirect = (value) =>
      !value
        ? undefined
        : {
            to:
              typeof optionInfo.redirect === "string"
                ? optionInfo.redirect
                : {
                    key: optionInfo.redirect.option,
                    value: optionInfo.redirect.value,
                  },
          };
  }
  /* c8 ignore stop */

  /* c8 ignore next 3 */
  if (optionInfo.deprecated) {
    handlers.deprecated = true;
  }

  // allow CLI overriding, e.g., prettier package.json --tab-width 1 --tab-width 2
  if (isCLI && !optionInfo.array) {
    const originalPreprocess = parameters.preprocess || ((x) => x);
    parameters.preprocess = (value, schema, utils) =>
      schema.preprocess(
        originalPreprocess(Array.isArray(value) ? value.at(-1) : value),
        utils,
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

export default normalizeOptions;
