"use strict";

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");
const { printToScreen } = require("./utils.js");

async function logFileInfoOrDie(context) {
  const {
    fileInfo: file,
    ignorePath,
    withNodeModules,
    plugins,
    pluginSearchDirs,
    config,
  } = context.argv;

  const fileInfo = await prettier.getFileInfo(file, {
    ignorePath,
    withNodeModules,
    plugins,
    pluginSearchDirs,
    resolveConfig: config !== false,
  });

  printToScreen(prettier.format(stringify(fileInfo), { parser: "json" }));
}

module.exports = logFileInfoOrDie;
