"use strict";

const dedent = require("dedent");
const semver = require("semver");
const currentVersion = require("../../package.json").version;
const loadPlugins = require("./load-plugins");

const CATEGORY_GLOBAL = "Global";
const CATEGORY_JAVASCRIPT = "JavaScript";
const CATEGORY_MARKDOWN = "Markdown";
const CATEGORY_SPECIAL = "Special";

/**
 * @typedef {Object} OptionInfo
 * @property {string} name
 * @property {string} since - available since version
 * @property {string} category
 * @property {'int' | 'boolean' | 'choice' | 'path'} type
 * @property {boolean?} deprecated - deprecated since version
 * @property {OptionRedirectInfo?} redirect - redirect deprecated option
 * @property {string} description
 * @property {string?} oppositeDescription - for `false` option
 * @property {OptionValueInfo} default
 * @property {OptionRangeInfo?} range - for type int
 * @property {OptionChoiceInfo?} choices - for type choice
 *
 * @typedef {number | boolean | string} OptionValue
 * @typedef {OptionValue | Array<{ since: string, value: OptionValue}>} OptionValueInfo
 *
 * @typedef {Object} OptionRedirectInfo
 * @property {string} option
 * @property {OptionValue} value
 *
 * @typedef {Object} OptionRangeInfo
 * @property {number} start - recommended range start
 * @property {number} end - recommended range end
 * @property {number} step - recommended range step
 *
 * @typedef {Object} OptionChoiceInfo
 * @property {boolean | string} value - boolean for the option that is originally boolean type
 * @property {string?} description - undefined if redirect
 * @property {string?} since - undefined if available since the first version of the option
 * @property {string?} deprecated - deprecated since version
 * @property {OptionValueInfo?} redirect - redirect deprecated value
 */
/** @type {OptionInfo[]} */
const supportOptions = [
  {
    name: "arrowParens",
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
  {
    name: "bracketSpacing",
    since: "0.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets."
  },
  {
    name: "cursorOffset",
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: -1,
    range: { start: -1, end: Infinity, step: 1 },
    description: dedent`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end.
    `
  },
  {
    name: "filepath",
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "path",
    default: undefined,
    description:
      "Specify the input filepath. This will be used to do parser inference."
  },
  {
    name: "insertPragma",
    since: "1.8.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: "Insert @format pragma into file's first docblock comment."
  },
  {
    name: "jsxBracketSameLine",
    since: "0.17.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Put > on the last line instead of at a new line."
  },
  {
    name: "parser",
    since: "0.0.10",
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: "babylon",
    description: "Which parser to use.",
    choices: [
      { value: "babylon", description: "JavaScript" },
      { value: "flow", description: "Flow" },
      { value: "typescript", since: "1.4.0", description: "TypeScript" },
      { value: "css", since: "1.7.1", description: "CSS" },
      {
        value: "postcss",
        since: "1.4.0",
        description: "CSS/Less/SCSS",
        deprecated: "1.7.1",
        redirect: "css"
      },
      { value: "less", since: "1.7.1", description: "Less" },
      { value: "scss", since: "1.7.1", description: "SCSS" },
      { value: "json", since: "1.5.0", description: "JSON" },
      { value: "graphql", since: "1.5.0", description: "GraphQL" },
      { value: "markdown", since: "1.8.0", description: "Markdown" }
    ]
  },
  {
    name: "printWidth",
    since: "0.0.0",
    category: CATEGORY_GLOBAL,
    type: "int",
    default: 80,
    description: "The line length where Prettier will try wrap.",
    range: { start: 0, end: Infinity, step: 1 }
  },
  {
    name: "proseWrap",
    since: "1.8.2",
    category: CATEGORY_MARKDOWN,
    type: "choice",
    default: [
      { since: "1.8.2", value: true },
      { since: "1.9.0", value: "preserve" }
    ],
    description: "How to wrap prose. (markdown)",
    choices: [
      {
        since: "1.9.0",
        value: "always",
        description: "Wrap prose if it exceeds the print width."
      },
      {
        since: "1.9.0",
        value: "never",
        description: "Do not wrap prose."
      },
      {
        since: "1.9.0",
        value: "preserve",
        description: "Wrap prose as-is."
      },
      { value: false, deprecated: "1.9.0", redirect: "never" },
      { value: true, deprecated: "1.9.0", redirect: "always" }
    ]
  },
  {
    name: "rangeEnd",
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: Infinity,
    range: { start: 0, end: Infinity, step: 1 },
    description: dedent`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
    `
  },
  {
    name: "rangeStart",
    since: "1.4.0",
    category: CATEGORY_SPECIAL,
    type: "int",
    default: 0,
    range: { start: 0, end: Infinity, step: 1 },
    description: dedent`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
    `
  },
  {
    name: "requirePragma",
    since: "1.7.0",
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: dedent`
      Require either '@prettier' or '@format' to be present in the file's first docblock comment
      in order for it to be formatted.
    `
  },
  {
    name: "semi",
    since: "1.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  {
    name: "singleQuote",
    since: "0.0.0",
    category: CATEGORY_JAVASCRIPT,
    type: "boolean",
    default: false,
    description: "Use single quotes instead of double quotes."
  },
  {
    name: "tabWidth",
    type: "int",
    category: CATEGORY_GLOBAL,
    default: 2,
    description: "Number of spaces per indentation level.",
    range: { start: 0, end: Infinity, step: 1 }
  },
  {
    name: "trailingComma",
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
  },
  {
    name: "useFlowParser",
    since: "0.0.0",
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    deprecated: "0.0.10",
    description: "Use flow parser.",
    redirect: { option: "parser", value: "flow" }
  },
  {
    name: "useTabs",
    since: "1.0.0",
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    description: "Indent with tabs instead of spaces."
  }
];

function getSupportInfo(version, opts) {
  opts = opts || {};

  if (!version) {
    version = currentVersion;
  }

  const options = supportOptions
      .filter(filterSince)
      .filter(filterDeprecated)
      .map(mapDeprecated)
      .map(option => {
        const newOption = Object.assign({}, option);

        if (Array.isArray(newOption.default)) {
          newOption.default = newOption.default
            .filter(filterSince)
            .sort((info1, info2) =>
              semver.compare(info2.since, info1.since)
            )[0].value;
        }

        if (Array.isArray(newOption.choices)) {
          newOption.choices = newOption.choices
            .filter(filterSince)
            .filter(filterDeprecated)
            .map(mapDeprecated);
        }

        return newOption;
      });

  const usePostCssParser = semver.lt(version, "1.7.1");

  const languages = loadPlugins()
    .reduce((all, plugin) => all.concat(plugin.languages), [])
    .filter(language => language.since && semver.gte(version, language.since))
    .map(language => {
      // Prevent breaking changes
      if (language.name === "Markdown") {
        return Object.assign({}, language, {
          parsers: ["markdown"]
        });
      }
      if (language.name === "TypeScript") {
        return Object.assign({}, language, {
          parsers: ["typescript"]
        });
      }

      if (usePostCssParser && language.group === "CSS") {
        return Object.assign({}, language, {
          parsers: ["postcss"]
        });
      }
      return language;
    });

  return { languages, options };

  function filterSince(object) {
    return (
      opts.showUnreleased ||
      !("since" in object) ||
      (object.since && semver.gte(version, object.since))
    );
  }
  function filterDeprecated(object) {
    return (
      opts.showDeprecated ||
      !("deprecated" in object) ||
      (object.deprecated && semver.lt(version, object.deprecated))
    );
  }
  function mapDeprecated(object) {
    if (!object.deprecated || opts.showDeprecated) {
      return object;
    }
    const newObject = Object.assign({}, object);
    delete newObject.deprecated;
    delete newObject.redirect;
    return newObject;
  }
}

module.exports = {
  getSupportInfo
};
