"use strict";

const commonOptions = require("../common/common-options");

const CATEGORY_JAVASCRIPT = "JavaScript";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
module.exports = {
  arrowParens: {
    since: "1.9.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: [
      { since: "1.9.0", value: "avoid" },
      { since: "2.0.0", value: "always" },
    ],
    description: "Include parentheses around a sole arrow function parameter.",
    choices: [
      {
        value: "always",
        description: "Always include parens. Example: `(x) => x`",
      },
      {
        value: "avoid",
        description: "Omit parens when possible. Example: `x => x`",
      },
    ],
  },
  // [prettierx ...]
  arrayBracketSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces between array brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.",
  },
  computedPropertySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces between computed property brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.",
  },
  indentChains: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Put indents at the start of chained calls.",
    oppositeDescription: "Disable indents at the start of chained calls.",
  },
  importFormatting: {
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: "auto",
    description:
      "Formatting of import statements, may be `oneline` to avoid conflict with" +
      ' VSCode "Organize Imports" feature.',
    choices: [
      {
        value: "auto",
        description: "automatic formatting, like Prettier",
      },
      {
        value: "oneline",
        description: "keep import statements on one line",
      },
    ],
  },
  spaceInParens: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      'Print spaces in between parens, WordPress style (similar to the corresponding eslint option). Not recommended in combination with the default `arrowParens: "always"` option. Status: experimental, with limited testing.',
  },
  spaceUnaryOps: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces after unary operator symbols, except in the middle of `!!` (similar to the corresponding eslint option). Status: experimental, with limited testing.",
  },
  templateCurlySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces between template curly brackets (similar to the corresponding eslint option). Status: experimental, with limited testing.",
  },
  typeAngleBracketSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces between type angle brackets. Status: experimental, with limited testing.",
  },
  typeBracketSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Print spaces between type brackets. Status: experimental, with limited testing.",
  },
  exportCurlySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Put spaces between export curly braces.",
    oppositeDescription: "Disable spaces between export curly braces.",
  },
  importCurlySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Put spaces between import curly braces.",
    oppositeDescription: "Disable spaces between import curly braces.",
  },
  objectCurlySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description:
      "Put spaces between object curly braces (similar to the corresponding eslint option).",
    oppositeDescription: "Disable spaces between object curly braces.",
  },
  typeCurlySpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Put spaces between type curly braces.",
    oppositeDescription: "Disable spaces between type curly braces.",
  },
  jsxBracketSameLine: {
    since: "0.17.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Put > on the last line instead of at a new line.",
  },
  semi: {
    since: "1.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them.",
  },
  // [prettierx ...]
  alignObjectProperties: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Align colons in multiline object literals.",
  },
  offsetTernaryExpressions: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      'Indent and align ternary expression branches more consistently with "Standard JS" (similar to the corresponding eslint option).',
  },
  generatorStarSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces around the star (`*`) in generator functions (before and after - similar to the corresponding eslint option). (Default is after only.)",
  },
  yieldStarSpacing: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put spaces around the star (`*`) in `yield*` expressions (before and after - similar to the corresponding eslint option). (Default is after only.)",
  },
  spaceBeforeFunctionParen: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Put a space before function parenthesis in all declarations (similar to the corresponding eslint option). (Default is to put a space before function parenthesis for untyped anonymous functions only.)",
  },
  breakBeforeElse: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Always add a line break before else.",
  },
  breakLongMethodChains: {
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description:
      "Break method chains with more than 3 method calls, like Prettier 1.x.",
  },
  singleQuote: commonOptions.singleQuote,
  jsxSingleQuote: {
    since: "1.15.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Use single quotes in JSX.",
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
        description: "Only add quotes around object properties where required.",
      },
      {
        value: "consistent",
        description:
          "If at least one property in an object requires quotes, quote all properties.",
      },
      {
        value: "preserve",
        description: "Respect the input use of quotes in object properties.",
      },
    ],
  },
  trailingComma: {
    since: "0.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "choice",
    default: [
      { since: "0.0.0", value: false },
      { since: "0.19.0", value: "none" },
      { since: "2.0.0", value: "es5" },
    ],
    description: "Print trailing commas wherever possible when multi-line.",
    choices: [
      {
        value: "es5",
        description:
          "Trailing commas where valid in ES5 (objects, arrays, etc.)",
      },
      { value: "none", description: "No trailing commas." },
      {
        value: "all",
        description:
          "Trailing commas wherever possible (including function arguments).",
      },
    ],
  },
};
