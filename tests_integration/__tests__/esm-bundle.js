"use strict";

const globby = require("globby");

const prettier = require("../../dist/esm/standalone.mjs").default;

const pluginsPromise = globby("../../dist/esm/parser-*.mjs", {
  cwd: __dirname,
}).then((files) => {
  return files.map((file) => require(file).default);
});

test("formats flow", async () => {
  expect(
    prettier.format("const num:number =1;", {
      parser: "flow",
      plugins: await pluginsPromise,
    })
  ).toMatchSnapshot();
});

test("formats typescript", async () => {
  expect(
    prettier.format("const num:number =1;", {
      parser: "typescript",
      plugins: await pluginsPromise,
    })
  ).toMatchSnapshot();
});

test("formats graphql", async () => {
  expect(
    prettier.format("query { child }", {
      parser: "graphql",
      plugins: await pluginsPromise,
    })
  ).toMatchSnapshot();
});

test("formats css", async () => {
  expect(
    prettier.format("body { color: red; }", {
      parser: "css",
      plugins: await pluginsPromise,
    })
  ).toMatchSnapshot();
});
