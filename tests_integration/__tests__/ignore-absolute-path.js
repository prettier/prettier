"use strict";

const path = require("path");
const runPrettier = require("../runPrettier");

test("support absolute filename", () => {
  const result = runPrettier("cli/ignore-absolute-path", [
    path.resolve(__dirname, "../cli/ignore-absolute-path/ignored/module.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/depth1/ignored/*.js"),
    path.resolve(__dirname, "../cli/ignore-absolute-path/regular-module.js"),
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});
