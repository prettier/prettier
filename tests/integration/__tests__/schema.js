"use strict";

const prettier = require("prettier-local");
const generateSchema = require("../../../scripts/generate-schema.js");

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
