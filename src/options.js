"use strict";
var defaults = {
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

// Copy options and fill in default values.
function normalize(options) {
  const normalized = Object.assign({}, options || {});

  // For backward compatibility. Deprecated in 0.0.10
  if ("useFlowParser" in normalized) {
    console.warn(
      'The `"useFlowParser": true/false` option is deprecated. Use `parser: "flow"` instead.'
    );
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
