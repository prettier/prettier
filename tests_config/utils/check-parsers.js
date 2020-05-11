"use strict";

const path = require("path");
const { outdent } = require("outdent");

const TESTS_ROOT = path.join(__dirname, "../../tests");

const getCategory = (dirname) =>
  path.relative(TESTS_ROOT, dirname).split(path.sep).shift();

const categoryParsers = new Map([
  [
    "angular",
    {
      parsers: ["angular", "__ng_interpolation", "__ng_action"],
      verifyParsers: [],
    },
  ],
  [
    "css",
    {
      parsers: ["css"],
      verifyParsers: ["less", "scss"],
    },
  ],
  [
    "flow",
    {
      // TODO: only allow `flow` and `babel-flow`
      parsers: ["babel", "flow", "babel-flow"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
    },
  ],
  [
    "flow-repo",
    {
      // TODO: only allow `flow` and `babel-flow`
      parsers: ["babel", "flow", "babel-flow"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
    },
  ],
  [
    "graphql",
    {
      parsers: ["graphql"],
      verifyParsers: [],
    },
  ],
  [
    "handlebars",
    {
      parsers: ["glimmer"],
      verifyParsers: [],
    },
  ],
  [
    "html",
    {
      parsers: ["html"],
      verifyParsers: [],
    },
  ],
  [
    "js",
    // TODO: only allow babel
    {
      parsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
    },
  ],
  [
    "json",
    {
      parsers: ["json", "json5", "json-stringify"],
      verifyParsers: [],
    },
  ],
  [
    "jsx",
    {
      parsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
    },
  ],
  ["less", { parsers: ["less"], verifyParsers: ["css", "scss"] }],
  ["lwc", { parsers: ["lwc"], verifyParsers: [] }],
  ["markdown", { parsers: ["markdown"], verifyParsers: [] }],
  ["mdx", { parsers: ["mdx"], verifyParsers: [] }],
  ["scss", { parsers: ["scss"], verifyParsers: ["css", "less"] }],
  ["stylefmt-repo", { parsers: ["css", "scss"], verifyParsers: [] }],
  [
    "typescript",
    {
      parsers: ["typescript", "babel-ts"],
      verifyParsers: ["babel", "flow", "babel-flow", "typescript", "babel-ts"],
    },
  ],
  ["vue", { parsers: ["vue"], verifyParsers: [] }],
  ["yaml", { parsers: ["yaml"], verifyParsers: [] }],
]);

const getParserCategories = (parser) => {
  const categories = [];
  for (const [category, { parsers }] of categoryParsers) {
    if (parsers.includes(parser)) {
      categories.push(category);
    }
  }

  return categories;
};

const checkParser = (dirname, parsers = []) => {
  const category = getCategory(dirname);
  const { parsers: allowedParsers, verifyParsers: allowedVerifyParsers } =
    categoryParsers.get(category) || {};

  const [parser, ...verifyParsers] = parsers;

  if (verifyParsers.includes(parser)) {
    throw new Error(
      `verifyParsers ${JSON.stringify(
        verifyParsers
      )} should not include parser "${parser}".`
    );
  }

  if (allowedParsers && !allowedParsers.includes(parser)) {
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

  if (allowedVerifyParsers) {
    for (const verifyParser of verifyParsers) {
      if (!allowedVerifyParsers.includes(verifyParser)) {
        throw new Error(
          outdent`
            Parser "${verifyParser}" should not used to verify in "${dirname}".
            Please remove it or config to allow use this parser in "${__filename}".
          `
        );
      }
    }
  }
};

module.exports = checkParser;
