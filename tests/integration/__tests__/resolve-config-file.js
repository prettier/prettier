"use strict";

const path = require("path");

const prettier = require("prettier-local");

test("API resolveConfigFile", async () => {
  const result = await prettier.resolveConfigFile();
  expect(result).toEqual(path.join(__dirname, "../../../.prettierrc"));
});

test("API resolveConfigFile.sync", () => {
  const result = prettier.resolveConfigFile.sync();
  expect(result).toEqual(path.join(__dirname, "../../../.prettierrc"));
});
