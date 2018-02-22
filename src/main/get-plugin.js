"use strict";

function getPlugin(options) {
  const astFormat = options.astFormat;

  if (!astFormat) {
    throw new Error("getPlugin() requires astFormat to be set");
  }
  const printerPlugin = options.plugins.find(
    plugin => plugin.printers[astFormat]
  );
  if (!printerPlugin) {
    throw new Error(`Couldn't find plugin for AST format "${astFormat}"`);
  }

  return printerPlugin;
}

module.exports = getPlugin;
