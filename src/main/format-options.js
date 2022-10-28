import { CATEGORY_FORMAT } from "./option-categories.js";

/*
TODO: Move some of these options to languages and only pass them when printer support that, see #13746.
*/

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
const formatOptions = {
  arrowParens: {
    category: CATEGORY_FORMAT,
    type: "choice",
    default: "always",
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
  jsxBracketSameLine: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    description: "Put > on the last line instead of at a new line.",
    deprecated: "2.4.0",
  },
  semi: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them.",
  },
  jsxSingleQuote: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Use single quotes in JSX.",
  },
  quoteProps: {
    category: CATEGORY_FORMAT,
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
    category: CATEGORY_FORMAT,
    type: "choice",
    default: "all",
    description: "Print trailing commas wherever possible when multi-line.",
    choices: [
      {
        value: "all",
        description:
          "Trailing commas wherever possible (including function arguments).",
      },
      {
        value: "es5",
        description:
          "Trailing commas where valid in ES5 (objects, arrays, etc.)",
      },
      { value: "none", description: "No trailing commas." },
    ],
  },
  bracketSpacing: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets.",
  },
  singleQuote: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Use single quotes instead of double quotes.",
  },
  proseWrap: {
    category: CATEGORY_FORMAT,
    type: "choice",
    default: "preserve",
    description: "How to wrap prose.",
    choices: [
      {
        value: "always",
        description: "Wrap prose if it exceeds the print width.",
      },
      {
        value: "never",
        description: "Do not wrap prose.",
      },
      {
        value: "preserve",
        description: "Wrap prose as-is.",
      },
    ],
  },
  bracketSameLine: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description:
      "Put > of opening tags on the last line instead of on a new line.",
  },
  singleAttributePerLine: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Enforce single attribute per line in HTML, Vue and JSX.",
  },
  htmlWhitespaceSensitivity: {
    category: CATEGORY_FORMAT,
    type: "choice",
    default: "css",
    description: "How to handle whitespaces in HTML.",
    choices: [
      {
        value: "css",
        description: "Respect the default value of CSS display property.",
      },
      {
        value: "strict",
        description: "Whitespaces are considered sensitive.",
      },
      {
        value: "ignore",
        description: "Whitespaces are considered insensitive.",
      },
    ],
  },
  vueIndentScriptAndStyle: {
    category: CATEGORY_FORMAT,
    type: "boolean",
    default: false,
    description: "Indent script and style tags in Vue files.",
  },
};

export default formatOptions;
