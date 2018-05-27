"use strict";

const prettier = require("../../tests_config/require_prettier");
const generateSchema = require("../../scripts/generate-schema");

test("schema", () => {
  expect(generateSchema(prettier.getSupportInfo().options)).toMatchSnapshot();
});
