"use strict";

const loadPlugins = require("../common/load-plugins");

function getPrinter(options) {
  const plugins = loadPlugins();
  const parserPlugin = plugins.find(plugin => plugin.parsers[options.parser]);
  if (!parserPlugin) {
    throw new Error(
      `Couldn't find parser plugin for parser "${options.parser}"`
    );
  }

  const astFormat = parserPlugin.parsers[options.parser].astFormat;
  const printerPlugin = plugins.find(plugin => plugin.printers[astFormat]);
  if (!printerPlugin) {
    throw new Error(
      `Couldn't find printer plugin for AST format "${astFormat}"`
    );
  }

  return printerPlugin.printers[astFormat];
}

module.exports = getPrinter;
