#!/usr/bin/env node

"use strict";

if (require.main !== module) {
  module.exports = generateSchema;
} else {
  const prettier = require("..");
  console.log(
    prettier.format(
      JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
      { parser: "json" }
    )
  );
}

function generateSchema(options) {
  return {
    $schema: "http://json-schema.org/draft-04/schema#",
    title: "Schema for .prettierrc",
    definitions: {
      optionsDefinition: {
        type: "object",
        properties: Object.fromEntries(
          options.map((option) => [option.name, optionToSchema(option)])
        ),
      },
      overridesDefinition: {
        type: "object",
        properties: {
          overrides: {
            type: "array",
            description:
              "Provide a list of patterns to override prettier configuration.",
            items: {
              type: "object",
              required: ["files"],
              properties: {
                files: {
                  description: "Include these files in this override.",
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                  ],
                },
                excludeFiles: {
                  description: "Exclude these files from this override.",
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } },
                  ],
                },
                options: {
                  type: "object",
                  description: "The options to apply for this override.",
                  $ref: "#/definitions/optionsDefinition",
                },
              },
              additionalProperties: false,
            },
          },
        },
      },
    },
    oneOf: [
      {
        type: "object",
        allOf: [
          { $ref: "#/definitions/optionsDefinition" },
          { $ref: "#/definitions/overridesDefinition" },
        ],
      },
      {
        type: "string",
      },
    ],
  };
}

function optionToSchema(option) {
  let schema;
  if (option.type === "choice") {
    const choicesSchema = option.choices.map(choiceToSchema);
    let key = "oneOf";
    if (option.name === "parser") {
      // To support custom parser
      //   ref: https://github.com/SchemaStore/schemastore/pull/1636
      choicesSchema.push({ type: "string", description: "Custom parser" });
      // We should use "anyOf" for "parser" option.
      //   ref: https://github.com/SchemaStore/schemastore/pull/1642
      key = "anyOf";
    }
    schema = { [key]: choicesSchema };
  } else {
    schema = { type: optionTypeToSchemaType(option.type) };
  }
  if (option.array) {
    schema = wrapWithArraySchema(schema);
  }
  return {
    description: option.description,
    default: option.default,
    ...schema,
  };
}

function wrapWithArraySchema(items) {
  return { type: "array", items };
}

function optionTypeToSchemaType(optionType) {
  switch (optionType) {
    case "int":
      return "integer";
    case "boolean":
      return optionType;
    case "choice":
      throw new Error(
        "Please use `oneOf` instead of `enum` for better description support."
      );
    case "path":
      return "string";
    default:
      throw new Error(`Unexpected optionType '${optionType}'`);
  }
}

function choiceToSchema(choice) {
  return { enum: [choice.value], description: choice.description };
}
