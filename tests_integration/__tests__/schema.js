"use strict";

const prettier = require("../..");
const generateSchema = require("../../scripts/generate-schema");

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
