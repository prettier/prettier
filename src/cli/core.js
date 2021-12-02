"use strict";

const path = require("path");

const stringify = require("fast-json-stable-stringify");

// eslint-disable-next-line no-restricted-modules
const prettier = require("../index.js");

const { format, formatStdin, formatFiles } = require("./format.js");
const { Context, parseArgvWithoutPlugins } = require("./context.js");
const {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
} = require("./option-map.js");
const { createDetailedUsage, createUsage } = require("./usage.js");
const { createLogger } = require("./logger.js");

async function logResolvedConfigPathOrDie(context) {
  const file = context.argv["find-config-path"];
  const configFile = await prettier.resolveConfigFile(file);
  if (configFile) {
    context.logger.log(path.relative(process.cwd(), configFile));
  } else {
    throw new Error(`Can not find configure file for "${file}"`);
  }
}

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
  parseArgvWithoutPlugins,
  createLogger,
};
