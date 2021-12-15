"use strict";

const stringify = require("fast-json-stable-stringify");
// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");

async function logFileInfoOrDie(context) {
  const options = {
    ignorePath: context.argv["ignore-path"],
    withNodeModules: context.argv["with-node-modules"],
    plugins: context.argv.plugin,
    pluginSearchDirs: context.argv["plugin-search-dir"],
    resolveConfig: context.argv.config !== false,
  };

  context.logger.log(
    prettier.format(
      stringify(await prettier.getFileInfo(context.argv["file-info"], options)),
      { parser: "json" }
    )
  );
}

module.exports = logFileInfoOrDie;
