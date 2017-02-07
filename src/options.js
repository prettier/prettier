"use strict";

var validate = require("jest-validate").validate;
var deprecatedConfig = require("./deprecated");

var defaults = {
  // Indent lines with tabs
  useTabs: false,
  // Number of spaces the pretty-printer should use per tab
  tabWidth: 2,
  // Fit code within this line limit
  printWidth: 80,
  // If true, will use single instead of double quotes
  singleQuote: false,
  // Controls the printing of trailing commas in objects and arrays
  trailingComma: false,
  // Controls the printing of trailing commas in js module imports
  trailingCommaImports: false,
  // Controls the printing of trailing commas in js module exports
  trailingCommaExports: false,
  // Controls the printing of trailing commas in function call arguments
  trailingCommaArgs: false,
  // Controls the printing of spaces inside arrays
  bracketSpacing: false,
  // Controls the printing of spaces inside objects
  bracesSpacing: true,
  // Close JSX tags on the last line instead of a new line (Facebok Style)
  jsxFbCloseTag: false,
  // Which parser to use. Valid options are 'flow' and 'babylon'
  parser: "babylon"
};

var exampleConfig = Object.assign({}, defaults, {
  filename: "testFilename",
  printWidth: 80,
  originalText: "text"
});

// Copy options and fill in default values.
function normalize(options) {
  validate(options, { exampleConfig, deprecatedConfig });
  const normalized = Object.assign({}, options || {});

  // For backward compatibility. Deprecated in 0.0.10
  if ("useFlowParser" in normalized) {
    normalized.parser = normalized.useFlowParser ? "flow" : "babylon";
    delete normalized.useFlowParser;
  }

  Object.keys(defaults).forEach(k => {
    if (normalized[k] == null) {
      normalized[k] = defaults[k];
    }
  });

  return normalized;
}

module.exports = { normalize };
