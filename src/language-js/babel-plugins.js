"use strict";

const cartesian = require("fast-cartesian-product");
const flat = require("lodash/flatten");

// When adding a plugin, please add a test in `tests/js/babel-plugins`,
// To remove plugins, remove it here and run `yarn test tests/js/babel-plugins` to verify
const noConflictPlugins = [
  "doExpressions",
  "classProperties",
  "exportDefaultFrom",
  "functionBind",
  "functionSent",
  "numericSeparator",
  "classPrivateProperties",
  "throwExpressions",
  "logicalAssignment",
  "classPrivateMethods",
  "v8intrinsic",
  "partialApplication",
  ["decorators", { decoratorsBeforeExport: false }],
  "privateIn",
  ["moduleAttributes", { version: "may-2020" }],
  ["recordAndTuple", { syntaxType: "hash" }],
];

const conflictPlugins = [
  [
    ["pipelineOperator", { proposal: "smart" }],
    ["pipelineOperator", { proposal: "minimal" }],
    ["pipelineOperator", { proposal: "fsharp" }],
  ].map((plugin) => [plugin]),
];

const commonPlugins = [[noConflictPlugins], ...conflictPlugins];

function normalizePlugins(combinations) {
  return combinations.map((conflictGroup) =>
    conflictGroup.map((plugins) =>
      plugins.map((plugin) => (Array.isArray(plugin) ? plugin : [plugin]))
    )
  );
}

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
  let plugins = [...commonPlugins, parserPluginCombinations];

  plugins = normalizePlugins(plugins);

  if (!text.includes("|>")) {
    plugins = filterPlugins(plugins, ([name]) => name !== "pipelineOperator");
  }

  plugins = cleanPlugins(plugins);
  for (const combinations of cartesian(plugins)) {
    yield flat(combinations);
  }
}

module.exports = generateCombinations;
