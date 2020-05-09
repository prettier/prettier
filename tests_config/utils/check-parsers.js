"use strict";

const path = require("path");
const { outdent } = require("outdent");

const TESTS_ROOT = path.join(__dirname, "../../tests");

const getCategory = (dirname) =>
  path.relative(TESTS_ROOT, dirname).split(path.sep).shift();

const categoryParsers = new Map(
  [
    ["angular", ["angular", "__ng_interpolation"]],
    ["css", ["css"]],
    ["flow", ["babel", "flow", "babel-flow"]],
    ["flow-repo", ["babel", "flow", "babel-flow"]],
    ["graphql", ["graphql"]],
    ["handlebars", ["glimmer"]],
    ["html", ["html"]],
    ["js", ["babel", "flow", "babel-flow", "typescript", "babel-ts"]],
    ["json", ["json", "json5", "json-stringify"]],
    ["jsx", ["babel", "flow", "babel-flow", "typescript", "babel-ts"]],
    ["less", ["less"]],
    ["lwc", ["lwc"]],
    ["markdown", ["markdown"]],
    ["mdx", ["mdx"]],
    ["scss", ["scss"]],
    ["stylefmt-repo", ["css", "scss"]],
    ["typescript", ["typescript", "babel-ts"]],
    ["vue", ["vue"]],
    ["yaml", ["yaml"]],
  ].map(([category, parsers]) => [category, new Set(parsers)])
);

const getParserCategories = (parser) => {
  const categories = [];
  for (const [category, parsers] of categoryParsers) {
    if (parsers.has(parser)) {
      categories.push(category);
    }
  }

  return categories;
};

const checkParser = (dirname, parsers) => {
  const category = getCategory(dirname);
  const allowedParsers = categoryParsers.get(category);

  if (!allowedParsers) {
    return;
  }

  for (const parser of parsers) {
    if (!allowedParsers.has(parser)) {
      const suggestCategories = getParserCategories(parser);

      const suggestion =
        suggestCategories.length === 0
          ? ""
          : outdent`
              Suggest move your tests to:
              ${suggestCategories
                .map((category) => `- ${path.join(TESTS_ROOT, category)}`)
                .join("\n")}

              Or config to allow use this parser in "${__filename}".
            `;

      throw new Error(
        `Parser "${parser}" should not used in "${dirname}".${
          suggestion ? `\n\n${suggestion}` : ""
        }`
      );
    }
  }
};

module.exports = checkParser;
