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
  createPlugin("doExpressions"),
  createPlugin("classProperties"),
  createPlugin("exportDefaultFrom"),
  createPlugin("functionBind"),
  createPlugin("functionSent"),
  createPlugin("numericSeparator"),
  createPlugin("classPrivateProperties"),
  createPlugin("throwExpressions"),
  createPlugin("logicalAssignment"),
  createPlugin("classPrivateMethods"),
  createPlugin("v8intrinsic"),
  createPlugin("partialApplication"),
  createPlugin("decorators", { decoratorsBeforeExport: false }),
  createPlugin("privateIn"),
  createPlugin("moduleAttributes", { version: "may-2020" }),
  createPlugin("recordAndTuple", { syntaxType: "hash" }),
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
  return combinations
    .map((conflictGroup) =>
      conflictGroup.filter((plugins) => plugins.length !== 0)
    )
    .filter((conflictGroup) => conflictGroup.length !== 0);
}

function* generateCombinations(text, parserPluginCombinations) {
  let plugins = [...commonPlugins, [...parserPluginCombinations]];

  if (!text.includes("|>")) {
    plugins = filterPlugins(plugins, ({ name }) => name !== "pipelineOperator");
  }

  plugins = cleanPlugins(plugins);
  for (const combinations of cartesian(plugins)) {
    yield flat(combinations).map(({ name, options }) => [name, options]);
  }
}

module.exports = {
  generateCombinations,
  babelPlugins: {
    jsx: createPlugin("jsx"),
    flow: createPlugin("flow"),
    flowWithOptions: createPlugin("flow", { all: true, enums: true }),
    typescript: createPlugin("typescript"),
  },
};
