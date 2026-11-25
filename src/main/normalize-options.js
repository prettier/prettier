import * as vnopts from "vnopts";

/**
 * @import {NamedOptionInfo} from "./support.js"
 */

let hasDeprecationWarned;

/**
 * @param {*} options
 * @param {*} optionInfos
 * @param {{ logger?: false; passThrough?: string[] | boolean; schemaFactory?: any; descriptor?: any; unknownHandler?: any }} param2
 */
function normalizeOptions(
  options,
  optionInfos,
  {
    logger = false,
    passThrough = false,
    schemaFactory = (infos) => infos.map((info) => optionInfoToSchema(info)),
    descriptor = vnopts.apiDescriptor,
    unknownHandler = vnopts.levenUnknownHandler,
  } = {},
) {
  const unknown = !passThrough
    ? unknownHandler
    : Array.isArray(passThrough)
      ? (key, value) =>
          !passThrough.includes(key) ? undefined : { [key]: value }
      : (key, value) => ({ [key]: value });

  const schemas = schemaFactory(optionInfos);
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

/**
 * @param {NamedOptionInfo} optionInfo
 * @param {any} param1
 * @returns
 */
function optionInfoToSchema(
  optionInfo,
  { SchemaConstructor, parameters: extraParameters, arrayPreprocess } = {},
) {
  const { name } = optionInfo;

  const parameters = { name };
  const handlers = {};

  if (!SchemaConstructor) {
    switch (optionInfo.type) {
      case "int":
        SchemaConstructor = vnopts.IntegerSchema;
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
      case "path":
        SchemaConstructor = vnopts.StringSchema;
        break;
      default:
        /* c8 ignore next */
        throw new Error(`Unexpected type ${optionInfo.type}`);
    }
  }

  Object.assign(parameters, extraParameters);

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

  return optionInfo.array
    ? vnopts.ArraySchema.create({
        ...(arrayPreprocess ? { preprocess: arrayPreprocess } : {}),
        ...handlers,
        // @ts-expect-error
        valueSchema: SchemaConstructor.create(parameters),
      })
    : SchemaConstructor.create({ ...parameters, ...handlers });
}

export { optionInfoToSchema };
export default normalizeOptions;
