"use strict";

const parser = require("./parser");

function getPrinter(options, plugins) {
  const parsers = parser.getParsers(plugins, options);
  const astFormat = parser.resolveParser(parsers, options).astFormat;
  const printerPlugin = plugins.find(plugin => plugin.printers[astFormat]);
  if (!printerPlugin) {
    throw new Error(
      `Couldn't find printer plugin for AST format "${astFormat}"`
    );
  }

  return printerPlugin.printers[astFormat];
}

module.exports = getPrinter;
