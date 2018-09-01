"use strict";

const vnopts = require("vnopts");

const cliDescriptor = {
  key: key => (key.length === 1 ? `-${key}` : `--${key}`),
  value: value => vnopts.apiDescriptor.value(value),
  pair: ({ key, value }) =>
    value === false
      ? `--no-${key}`
      : value === true
        ? cliDescriptor.key(key)
        : value === ""
          ? `${cliDescriptor.key(key)} without an argument`
          : `${cliDescriptor.key(key)}=${value}`
};

function normalizeOptions(
  options,
  optionInfos,
  { logger, isCLI = false, passThrough = false } = {}
) {
  const unknown = !passThrough
    ? vnopts.levenUnknownHandler
    : Array.isArray(passThrough)
      ? (key, value) =>
          passThrough.indexOf(key) === -1 ? undefined : { [key]: value }
      : (key, value) => ({ [key]: value });

  const descriptor = isCLI ? cliDescriptor : vnopts.apiDescriptor;
  const schemas = optionInfosToSchemas(optionInfos, { isCLI });
  return vnopts.normalize(options, schemas, { logger, unknown, descriptor });
}

function optionInfosToSchemas(optionInfos, { isCLI }) {
  const schemas = [];

  if (isCLI) {
    schemas.push(vnopts.AnySchema.create({ name: "_" }));
  }

  for (const optionInfo of optionInfos) {
    schemas.push(optionInfoToSchema(optionInfo, { isCLI }));

    if (optionInfo.alias && isCLI) {
      schemas.push(
        vnopts.AliasSchema.create({
          name: optionInfo.alias,
          sourceName: optionInfo.name
        })
      );
    }
  }

  return schemas;
}

function optionInfoToSchema(optionInfo, { isCLI }) {
  let SchemaConstructor;
  const parameters = { name: optionInfo.name };
  const handlers = {};

  switch (optionInfo.type) {
    case "int":
      SchemaConstructor = vnopts.IntegerSchema;
      if (isCLI) {
        parameters.preprocess = value => Number(value);
      }
      break;
    case "choice":
      SchemaConstructor = vnopts.ChoiceSchema;
      parameters.choices = optionInfo.choices.map(
        choiceInfo =>
          typeof choiceInfo === "object" && choiceInfo.redirect
            ? Object.assign({}, choiceInfo, {
                redirect: {
                  to: { key: optionInfo.name, value: choiceInfo.redirect }
                }
              })
            : choiceInfo
      );
      break;
    case "boolean":
      SchemaConstructor = vnopts.BooleanSchema;
      break;
    case "flag":
    case "path":
      SchemaConstructor = vnopts.StringSchema;
      break;
    default:
      throw new Error(`Unexpected type ${optionInfo.type}`);
  }

  if (optionInfo.exception) {
    parameters.validate = (value, schema, utils) => {
      return optionInfo.exception(value) || schema.validate(value, utils);
    };
  } else {
    parameters.validate = (value, schema, utils) => {
      return value === undefined || schema.validate(value, utils);
    };
  }

  if (optionInfo.redirect) {
    handlers.redirect = value =>
      !value
        ? undefined
        : {
            to: {
              key: optionInfo.redirect.option,
              value: optionInfo.redirect.value
            }
          };
  }

  if (optionInfo.deprecated) {
    handlers.deprecated = true;
  }

  return optionInfo.array
    ? vnopts.ArraySchema.create(
        Object.assign(
          isCLI ? { preprocess: v => [].concat(v) } : {},
          handlers,
          { valueSchema: SchemaConstructor.create(parameters) }
        )
      )
    : SchemaConstructor.create(Object.assign({}, parameters, handlers));
}

function normalizeApiOptions(options, optionInfos, opts) {
  return normalizeOptions(options, optionInfos, opts);
}

function normalizeCliOptions(options, optionInfos, opts) {
  return normalizeOptions(
    options,
    optionInfos,
    Object.assign({ isCLI: true }, opts)
  );
}

module.exports = {
  normalizeApiOptions,
  normalizeCliOptions
};
