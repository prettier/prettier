"use strict";

const cartesian = require("fast-cartesian-product");
const flat = require("lodash/flatten");

const createPlugin = (name, options = {}, test = () => true) => ({
  name,
  options,
  test,
});

// When adding a plugin, please add a test in `tests/js/babel-plugins`,
// To remove plugins, remove it here and run `yarn test tests/js/babel-plugins` to verify
const noConflictPlugins = [
  createPlugin("doExpressions", undefined, (text) => text.includes("do")),
  createPlugin("classProperties", undefined, (text) => text.includes("class")),
  createPlugin(
    "exportDefaultFrom",
    undefined,
    (text) => text.includes("export") && text.includes("from")
  ),
  createPlugin("functionBind", undefined, (text) => text.includes("::")),
  createPlugin("functionSent", undefined, (text) => text.includes("sent")),
  createPlugin("numericSeparator", undefined, (text) =>
    /[\dA-Fa-f]_[\dA-Fa-f]/.test(text)
  ),
  createPlugin(
    "classPrivateProperties",
    undefined,
    (text) => text.includes("class") && text.includes("#")
  ),
  createPlugin("throwExpressions", undefined, (text) => text.includes("throw")),
  createPlugin(
    "logicalAssignment",
    undefined,
    (text) => text.includes("||=") || text.includes("&&=")
  ),
  createPlugin("classPrivateMethods", undefined, (text) =>
    // Not sure about this, tests/js/private-in, didn't use class
    // text.includes("class") &&
    text.includes("#")
  ),
  createPlugin("v8intrinsic", undefined, (text) => text.includes("%")),
  createPlugin("partialApplication", undefined, (text) => text.includes("?")),
  createPlugin("decorators", { decoratorsBeforeExport: false }, (text) =>
    text.includes("@")
  ),
  createPlugin(
    "privateIn",
    undefined,
    (text) => text.includes("#") && text.includes("in")
  ),
  createPlugin("moduleAttributes", { version: "may-2020" }, (text) =>
    text.includes("import")
  ),
  createPlugin(
    "recordAndTuple",
    { syntaxType: "hash" },
    (text) => text.includes("#[") || text.includes("#{")
  ),
];

const conflictPlugins = [
  [
    createPlugin("pipelineOperator", { proposal: "smart" }),
    createPlugin("pipelineOperator", { proposal: "minimal" }),
    createPlugin("pipelineOperator", { proposal: "fsharp" }),
  ].map((plugin) => [plugin]),
];

const commonPlugins = [[noConflictPlugins], ...conflictPlugins];

function filterPlugins(combinations, predicate) {
  return combinations.map((conflictGroup) =>
    conflictGroup.map((plugins) => plugins.filter(predicate))
  );
}

function cleanPlugins(combinations) {
  return combinations.filter(
    (conflictGroup) =>
      conflictGroup.every((plugins) => plugins.length !== 0) &&
      conflictGroup.length !== 0
  );
}

function* generateCombinations(text, parserPluginCombinations) {
  let plugins = [...commonPlugins, [...parserPluginCombinations]];

  plugins = filterPlugins(plugins, ({ test }) => test(text));

  if (!text.includes("|>")) {
    plugins = filterPlugins(plugins, ({ name }) => name !== "pipelineOperator");
  }

  plugins = cleanPlugins(plugins);

  // requires at least one combination
  if (plugins.length === 0) {
    return yield [[]];
  }

  for (const combinations of cartesian(plugins)) {
    yield flat(combinations).map(({ name, options }) => [name, options]);
  }
}

module.exports = {
  generateCombinations,
  babelPlugins: {
    jsx: createPlugin("jsx", undefined, (text) => /<\/|\/>/.test(text)),
    flow: createPlugin("flow"),
    flowWithOptions: createPlugin("flow", { all: true, enums: true }),
    typescript: createPlugin("typescript"),
  },
};
