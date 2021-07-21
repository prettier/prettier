"use strict";

const prettier = require("prettier-local");

test("schema", async () => {
  const { default: generateSchema } = await import(
    "../../../scripts/utils/generate-schema.mjs"
  );
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
