"use strict";

function getPrinter(options) {
  const astFormat = options.astFormat;

  if (!astFormat) {
    throw new Error("getPrinter() requires astFormat to be set");
  }
  const printerPlugin = options.plugins.find(
    plugin => plugin.printers[astFormat]
  );
  if (!printerPlugin) {
    throw new Error(
      `Couldn't find printer plugin for AST format "${astFormat}"`
    );
  }

  return printerPlugin.printers[astFormat];
}

module.exports = getPrinter;
