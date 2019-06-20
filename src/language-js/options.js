"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_JAVASCRIPT = "JavaScript";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  arrowParens: {
    since: "1.9.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: "avoid",
    description: "Include parentheses around a sole arrow function parameter.",
    choices: [
      {
        value: "avoid",
        description: "Omit parens when possible. Example: `x => x`"
      },
      {
        value: "always",
        description: "Always include parens. Example: `(x) => x`"
      }
    ]
  },
  bracketSpacing: commonOptions.bracketSpacing,
  indentChains: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print indents at the start of chained calls.",
    oppositeDescription: "Do not print indents at the start of chained calls."
  },
  parenSpacing: commonOptions.parenSpacing,
  jsxBracketSameLine: {
    since: "0.17.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Put > on the last line instead of at a new line."
  },
  semi: {
    since: "1.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  alignObjectProperties: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Align colons in multiline object literals."
  },
  alignTernaryLines: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Align ternary lines.",
    oppositeDescription: "Do not align ternary lines."
  },
  generatorStarSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Add spaces around the star ('*') in generator functions (before and after - from eslint)."
  },
  yieldStarSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Add spaces around the star ('*') in `yield*` expressions (before and after - from eslint)."
  },
  spaceBeforeFunctionParen: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Put a space before function parenthesis."
  },
  singleQuote: commonOptions.singleQuote,
  jsxSingleQuote: {
    since: "1.15.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Use single quotes in JSX."
  },
  quoteProps: {
    since: "1.17.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: "as-needed",
    description: "Change when properties in objects are quoted.",
    choices: [
      {
        value: "as-needed",
        description: "Only add quotes around object properties where required."
      },
      {
        value: "consistent",
        description:
          "If at least one property in an object requires quotes, quote all properties."
      },
      {
        value: "preserve",
        description: "Respect the input use of quotes in object properties."
      }
    ]
  },
  trailingComma: {
    since: "0.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: [
      { since: "0.0.0", value: false },
      { since: "0.19.0", value: "none" }
    ],
    description: "Print trailing commas wherever possible when multi-line.",
    choices: [
      { value: "none", description: "No trailing commas." },
      {
        value: "es5",
        description:
          "Trailing commas where valid in ES5 (objects, arrays, etc.)"
      },
      {
        value: "all",
        description:
          "Trailing commas wherever possible (including function arguments)."
      },
      { value: true, deprecated: "0.19.0", redirect: "es5" },
      { value: false, deprecated: "0.19.0", redirect: "none" }
    ]
  }
};
