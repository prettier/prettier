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
  semi: true,
  arrowFnParens: "default"
};

const trailingCommaEnum = ["none", "es5", "all"];

const arrowFnParensEnum = ["avoid", "default", "always"];

const exampleConfig = Object.assign({}, defaults, {
  filepath: "path/to/Filename",
  printWidth: 80,
  originalText: "text"
});

// Copy options and fill in default values.
function normalize(options) {
  const normalized = Object.assign({}, options || {});
  const filepath = normalized.filepath;

  if (/\.(css|less|scss)$/.test(filepath)) {
    normalized.parser = "postcss";
  } else if (/\.html$/.test(filepath)) {
    normalized.parser = "parse5";
  } else if (/\.(ts|tsx)$/.test(filepath)) {
    normalized.parser = "typescript";
  } else if (/\.(graphql|gql)$/.test(filepath)) {
    normalized.parser = "graphql";
  } else if (/\.json$/.test(filepath)) {
    normalized.parser = "json";
  }

  if (normalized.parser === "json") {
    normalized.trailingComma = "none";
  }

  if (typeof normalized.trailingComma === "boolean") {
    // Support a deprecated boolean type for the trailing comma config
    // for a few versions. This code can be removed later.
    normalized.trailingComma = "es5";

    console.warn(
      "Warning: `trailingComma` without any argument is deprecated. " +
        'Specify "none", "es5", or "all".'
    );
  } else if (
    normalized.trailingComma &&
    !trailingCommaEnum.includes(normalized.trailingComma)
  ) {
    console.warn(
      `Warning: \`trailingComma\` must be one of ${trailingCommaEnum.join(
        ", "
      )} - received '${normalized.trailingComma}'.`
    );
  }

  if (
    normalized.arrowFnParens &&
    !arrowFnParensEnum.includes(normalized.arrowFnParens)
  ) {
    console.warn(
      `Warning: \`arrowFnParens\` must be one of ${arrowFnParensEnum.join(
        ", "
      )} - received '${normalized.arrowFnParens}'.`
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
