"use strict";

const validate = require("jest-validate").validate;
const deprecatedConfig = require("./deprecated");

const defaults = {
  cursorOffset: -1,
  rangeStart: 0,
  rangeEnd: Infinity,
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  parser: "babylon",
  insertPragma: false,
  requirePragma: false,
  semi: true
};

const exampleConfig = Object.assign({}, defaults, {
  filepath: "path/to/Filename",
  printWidth: 80,
  originalText: "text"
});

// Copy options and fill in default values.
function normalize(options) {
  const normalized = Object.assign({}, options || {});
  const filepath = normalized.filepath;

  if (/\.css$/.test(filepath)) {
    normalized.parser = "css";
  } else if (/\.less$/.test(filepath)) {
    normalized.parser = "less";
  } else if (/\.scss$/.test(filepath)) {
    normalized.parser = "scss";
  } else if (/\.html$/.test(filepath)) {
    normalized.parser = "parse5";
  } else if (/\.(ts|tsx)$/.test(filepath)) {
    normalized.parser = "typescript";
  } else if (/\.(graphql|gql)$/.test(filepath)) {
    normalized.parser = "graphql";
  } else if (/\.json$/.test(filepath)) {
    normalized.parser = "json";
  } else if (/\.(md|markdown)$/.test(filepath)) {
    normalized.parser = "markdown";
  }

  if (normalized.parser === "json") {
    normalized.trailingComma = "none";
  }

  /* istanbul ignore if */
  if (typeof normalized.trailingComma === "boolean") {
    // Support a deprecated boolean type for the trailing comma config
    // for a few versions. This code can be removed later.
    normalized.trailingComma = "es5";

    console.warn(
      "Warning: `trailingComma` without any argument is deprecated. " +
        'Specify "none", "es5", or "all".'
    );
  }

  /* istanbul ignore if */
  if (normalized.parser === "postcss") {
    normalized.parser = "css";

    console.warn(
      'Warning: `parser` with value "postcss" is deprecated. ' +
        'Use "css", "less" or "scss" instead.'
    );
  }

  const parserBackup = normalized.parser;
  if (typeof normalized.parser === "function") {
    // Delete the function from the object to pass validation.
    delete normalized.parser;
  }

  validate(normalized, { exampleConfig, deprecatedConfig });

  // Restore the option back to a function;
  normalized.parser = parserBackup;

  // For backward compatibility. Deprecated in 0.0.10
  /* istanbul ignore if */
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

module.exports = { normalize, defaults };
