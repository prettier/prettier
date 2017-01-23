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
  // Controls the printing of trailing commas wherever possible
  trailingComma: false,
  // Controls the printing of spaces inside array and objects
  bracketSpacing: true,
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
