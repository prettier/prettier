"use strict";

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");

async function logFileInfoOrDie(context) {
  const options = {
    ignorePath: context.argv.ignorePath,
    withNodeModules: context.argv.withNodeModules,
    plugins: context.argv.plugin,
    pluginSearchDirs: context.argv.pluginSearchDir,
    resolveConfig: context.argv.config !== false,
  };

  context.logger.log(
    prettier.format(
      stringify(await prettier.getFileInfo(context.argv.fileInfo, options)),
      { parser: "json" }
    )
  );
}

module.exports = logFileInfoOrDie;
