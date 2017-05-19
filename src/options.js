"use strict";

var validate = require("jest-validate").validate;
var deprecatedConfig = require("./deprecated");
var defaultsTrailingComma = {
  array: false,
  object: false,
  import: false,
  export: false,
  arguments: false
};
var trailingCommaPresets = {
  none: Object.assign({}, defaultsTrailingComma),
  es5: Object.assign({}, defaultsTrailingComma, {
    array: true,
    object: true,
    import: true,
    export: true
  }),
  all: Object.assign({}, defaultsTrailingComma, {
    array: true,
    object: true,
    import: true,
    export: true,
    arguments: true
  })
};
var defaults = {
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  trailingComma: Object.assign({}, defaultsTrailingComma),
  bracketSpacing: false,
  bracesSpacing: true,
  breakProperty: false,
  arrowParens: false,
  arrayExpand: false,
  flattenTernaries: false,
  breakBeforeElse: false,
  jsxBracketSameLine: false,
  alignObjectProperties: false,
  noSpaceEmptyFn: false,
  parser: "babylon",
  semi: true,
  __log: false
};

var exampleConfig = Object.assign({}, defaults, {
  filename: "testFilename",
  printWidth: 80,
  originalText: "text"
});

function normalizeTrailingComma(value) {
  var trailingComma;
  if ("boolean" === typeof value) {
    // Support a deprecated boolean type for the trailing comma config
    // for a few versions. This code can be removed later.
    trailingComma = Object.assign({}, trailingCommaPresets[value ? "es5" : "none"]);

    console.warn(
      "Warning: `trailingComma` without any argument is deprecated. " +
        'Specify "none", "es5", or "all".'
    );
  } else if ("object" === typeof value) {
    trailingComma = {};
    Object.keys(defaultsTrailingComma).forEach(k => {
      trailingComma[k] = null == value[k]
        ? defaultsTrailingComma[k]
        : value[k];
    });
  } else if ("string" === typeof value) {
    trailingComma = trailingCommaPresets[value];
    if ( trailingComma ) {
      trailingComma = Object.assign({}, trailingComma);
    } else {
      trailingComma = Object.assign({}, trailingCommaPresets.none);
      value.split(',').forEach(k => {
        if (k in defaultsTrailingComma) {
          trailingComma[k] = true;
        }
      });
    }
  } else {
    trailingComma = Object.assign({}, defaultsTrailingComma);
  }
  return trailingComma;
}

// Copy options and fill in default values.
function normalize(options) {
  const normalized = Object.assign({}, options || {});

  normalized.trailingComma = normalizeTrailingComma(normalized.trailingComma);
  validate(normalized, { exampleConfig, deprecatedConfig });

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
