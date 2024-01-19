import { format, getSupportInfo } from "../../src/index.js";

function generateSchemaData(options) {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "https://json.schemastore.org/prettierrc.json",
    definitions: {
      optionsDefinition: {
        type: "object",
        properties: Object.fromEntries(
          options
            .sort(({ name: optionNameA }, { name: optionNameB }) =>
              optionNameA.localeCompare(optionNameB),
            )
            .map((option) => [option.name, optionToSchema(option)]),
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
                  $ref: "#/definitions/optionsDefinition",
                  type: "object",
                  description: "The options to apply for this override.",
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
    title: "Schema for .prettierrc",
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
        "Please use `oneOf` instead of `enum` for better description support.",
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

async function generateSchema() {
  const supportInfo = await getSupportInfo();
  const schema = generateSchemaData(supportInfo.options);
  return format(JSON.stringify(schema, undefined, 2), { parser: "json" });
}

export { generateSchema, generateSchemaData };
