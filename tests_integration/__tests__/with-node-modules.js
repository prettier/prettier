"use strict";

const runPrettier = require("../runPrettier");

test("ignores node_modules by default", () => {
  const { stdout, status } = runPrettier("cli/with-node-modules", [
    "**/*.js",
    "-l"
  ]);
  const files = stdout.split("\n");

  expect(files).not.toContain("node_modules/node-module.js");
  expect(files).toContain("regular-module.js");
  expect(files).toContain("not_node_modules/file.js");
  expect(status).toBe(1);
});

test("doesn't ignore node_modules with --with-node-modules flag", () => {
  const { stdout, status } = runPrettier("cli/with-node-modules", [
    "**/*.js",
    "-l",
    "--with-node-modules"
  ]);
  const files = stdout.split("\n");

  expect(files).toContain("node_modules/node-module.js");
  expect(files).toContain("regular-module.js");
  expect(files).toContain("not_node_modules/file.js");
  expect(status).toBe(1);
});

test("ignores node_modules by default for file list", () => {
  const { stdout, status } = runPrettier("cli/with-node-modules", [
    "node_modules/node-module.js",
    "regular-module.js",
    "-l"
  ]);
  const files = stdout.split("\n");

  expect(files).not.toContain("node_modules/node-module.js");
  expect(files).toContain("regular-module.js");
  expect(status).toBe(1);
});

test("doesn't ignore node_modules with --with-node-modules flag for file list", () => {
  const { stdout, status } = runPrettier("cli/with-node-modules", [
    "node_modules/node-module.js",
    "regular-module.js",
    "-l",
    "--with-node-modules"
  ]);
  const files = stdout.split("\n");

  expect(files).toContain("node_modules/node-module.js");
  expect(files).toContain("regular-module.js");
  expect(status).toBe(1);
});
