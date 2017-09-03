"use strict";

const runPrettier = require("../runPrettier");

test("ignores node_modules by default", () => {
  const result = runPrettier("cli/with-node-modules", ["**/*.js", "-l"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("ignores node_modules by with ./**/*.js", () => {
  const result = runPrettier("cli/with-node-modules", ["./**/*.js", "-l"]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("doesn't ignore node_modules with --with-node-modules flag", () => {
  const result = runPrettier("cli/with-node-modules", [
    "**/*.js",
    "-l",
    "--with-node-modules"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("ignores node_modules by default for file list", () => {
  const result = runPrettier("cli/with-node-modules", [
    "node_modules/node-module.js",
    "not_node_modules/file.js",
    "regular-module.js",
    "-l"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});

test("doesn't ignore node_modules with --with-node-modules flag for file list", () => {
  const result = runPrettier("cli/with-node-modules", [
    "node_modules/node-module.js",
    "not_node_modules/file.js",
    "regular-module.js",
    "-l",
    "--with-node-modules"
  ]);

  expect(result.stdout).toMatchSnapshot();
  expect(result.status).toEqual(1);
});
