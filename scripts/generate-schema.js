#!/usr/bin/env node

"use strict";

const prettier = require("..");

console.log(
  prettier.format(
    JSON.stringify(generateSchema(prettier.getSupportInfo().options)),
    { parser: "json" }
  )
);

function generateSchema(options) {
  return {
    $schema: "http://json-schema.org/draft-04/schema#",
    title: "Schema for .prettierrc",
    type: "object",
    definitions: {
      optionsDefinition: {
        type: "object",
        properties: options.reduce(
          (props, option) =>
            Object.assign(props, { [option.name]: optionToSchema(option) }),
          {}
        )
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
                    { type: "array", items: { type: "string" } }
                  ]
                },
                excludeFiles: {
                  description: "Exclude these files from this override.",
                  oneOf: [
                    { type: "string" },
                    { type: "array", items: { type: "string" } }
                  ]
                },
                options: {
                  type: "object",
                  description: "The options to apply for this override.",
                  $ref: "#/definitions/optionsDefinition"
                }
              },
              additionalProperties: false
            }
          }
        }
      }
    },
    allOf: [
      { $ref: "#/definitions/optionsDefinition" },
      { $ref: "#/definitions/overridesDefinition" }
    ]
  };
}

function optionToSchema(option) {
  return Object.assign(
    {
      description: option.description,
      default: option.default
    },
    option.type === "choice"
      ? { oneOf: option.choices.map(choiceToSchema) }
      : { type: optionTypeToSchemaType(option.type) }
  );
}

function optionTypeToSchemaType(optionType) {
  switch (optionType) {
    case "int":
      return "integer";
    case "array":
    case "boolean":
      return optionType;
    case "choice":
      throw new Error(
        "Please use `oneOf` instead of `enum` for better description support."
      );
    default:
      return "string";
  }
}

function choiceToSchema(choice) {
  return { enum: [choice.value], description: choice.description };
}
