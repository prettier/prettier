"use strict";

const path = require("path");

const stringify = require("fast-json-stable-stringify");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index");

const { format, formatStdin, formatFiles } = require("./format");
const Context = require("./context");
const {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
} = require("./option-map");
const { createDetailedUsage, createUsage } = require("./usage");

function logResolvedConfigPathOrDie(context) {
  const configFile = prettier.resolveConfigFile.sync(
    context.argv["find-config-path"]
  );
  if (configFile) {
    context.logger.log(path.relative(process.cwd(), configFile));
  } else {
    process.exit(1);
  }
}

function logFileInfoOrDie(context) {
  const options = {
    ignorePath: context.argv["ignore-path"],
    withNodeModules: context.argv["with-node-modules"],
    plugins: context.argv.plugin,
    pluginSearchDirs: context.argv["plugin-search-dir"],
    resolveConfig: context.argv.config !== false,
  };

  context.logger.log(
    prettier.format(
      stringify(prettier.getFileInfo.sync(context.argv["file-info"], options)),
      { parser: "json" }
    )
  );
}

module.exports = {
  Context,
  createDetailedOptionMap,
  createDetailedUsage,
  createUsage,
  format,
  formatFiles,
  formatStdin,
  logResolvedConfigPathOrDie,
  logFileInfoOrDie,
  normalizeDetailedOptionMap,
};
