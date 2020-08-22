"use strict";

const globby = require("globby");

const prettier = require("../../dist/esm/standalone.mjs").default;
const codeSamples = require("../../website/playground/codeSamples").default;

const parsers = [
  "angular",
  "babel",
  "css",
  "flow",
  "glimmer",
  "graphql",
  "html",
  "markdown",
  "typescript",
  "yaml",
];

const pluginsPromise = globby("../../dist/esm/parser-*.mjs", {
  cwd: __dirname,
}).then((files) => {
  return files.map((file) => require(file).default);
});

parsers.forEach((parser) => {
  test(`format ${parser}`, async () => {
    expect(
      prettier.format(codeSamples(parser), {
        parser,
        plugins: await pluginsPromise,
      })
    ).toMatchSnapshot();
  });
});
