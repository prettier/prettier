"use strict";

const loadPlugins = require("../common/load-plugins");
const resolveParser = require("./parser").resolveParser;

function getPrinter(options) {
  const plugins = loadPlugins();

  const astFormat = resolveParser(options).astFormat;
  const printerPlugin = plugins.find(plugin => plugin.printers[astFormat]);
  if (!printerPlugin) {
    throw new Error(
      `Couldn't find printer plugin for AST format "${astFormat}"`
    );
  }

  return printerPlugin.printers[astFormat];
}

module.exports = getPrinter;
