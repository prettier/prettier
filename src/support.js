"use strict";

const dedent = require("dedent");
const semver = require("semver");
const currentVersion = require("../package.json").version;

const CATEGORY_GLOBAL = "Global";
const CATEGORY_JAVASCRIPT = "JavaScript";
const CATEGORY_MARKDOWN = "Markdown";
const CATEGORY_SPECIAL = "Special";

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml
const supportLanguages = [
  {
    name: "JavaScript",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    tmScope: "source.js",
    aceMode: "javascript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "text/javascript",
    aliases: ["js", "node"],
    extensions: [
      ".js",
      "._js",
      ".bones",
      ".es",
      ".es6",
      ".frag",
      ".gs",
      ".jake",
      ".jsb",
      ".jscad",
      ".jsfl",
      ".jsm",
      ".jss",
      ".mjs",
      ".njs",
      ".pac",
      ".sjs",
      ".ssjs",
      ".xsjs",
      ".xsjslib"
    ],
    filenames: ["Jakefile"],
    linguistLanguageId: 183,
    vscodeLanguageIds: ["javascript"]
  },
  {
    name: "JSX",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    extensions: [".jsx"],
    tmScope: "source.js.jsx",
    aceMode: "javascript",
    codemirrorMode: "jsx",
    codemirrorMimeType: "text/jsx",
    liguistLanguageId: 178,
    vscodeLanguageIds: ["javascriptreact"]
  },
  {
    name: "TypeScript",
    since: "1.4.0",
    parsers: ["typescript"],
    group: "JavaScript",
    aliases: ["ts"],
    extensions: [".ts", ".tsx"],
    tmScope: "source.ts",
    aceMode: "typescript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/typescript",
    liguistLanguageId: 378,
    vscodeLanguageIds: ["typescript", "typescriptreact"]
  },
  {
    name: "CSS",
    since: "1.4.0",
    parsers: ["css"],
    group: "CSS",
    tmScope: "source.css",
    aceMode: "css",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    extensions: [".css"],
    liguistLanguageId: 50,
    vscodeLanguageIds: ["css"]
  },
  {
    name: "Less",
    since: "1.4.0",
    parsers: ["less"],
    group: "CSS",
    extensions: [".less"],
    tmScope: "source.css.less",
    aceMode: "less",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    liguistLanguageId: 198,
    vscodeLanguageIds: ["less"]
  },
  {
    name: "SCSS",
    since: "1.4.0",
    parsers: ["scss"],
    group: "CSS",
    tmScope: "source.scss",
    aceMode: "scss",
    codemirrorMode: "css",
    codemirrorMimeType: "text/x-scss",
    extensions: [".scss"],
    liguistLanguageId: 329,
    vscodeLanguageIds: ["scss"]
  },
  {
    name: "GraphQL",
    since: "1.5.0",
    parsers: ["graphql"],
    extensions: [".graphql", ".gql"],
    tmScope: "source.graphql",
    aceMode: "text",
    liguistLanguageId: 139,
    vscodeLanguageIds: ["graphql"]
  },
  {
    name: "JSON",
    since: "1.5.0",
    parsers: ["json"],
    group: "JavaScript",
    tmScope: "source.json",
    aceMode: "json",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/json",
    extensions: [
      ".json",
      ".json5",
      ".geojson",
      ".JSON-tmLanguage",
      ".topojson"
    ],
    filenames: [
      ".arcconfig",
      ".jshintrc",
      ".babelrc",
      ".eslintrc",
      ".prettierrc",
      "composer.lock",
      "mcmod.info"
    ],
    linguistLanguageId: 174,
    vscodeLanguageIds: ["json"]
  },
  {
    name: "Markdown",
    since: "1.8.0",
    parsers: ["markdown"],
    aliases: ["pandoc"],
    aceMode: "markdown",
    codemirrorMode: "gfm",
    codemirrorMimeType: "text/x-gfm",
    wrap: true,
    extensions: [
      ".md",
      ".markdown",
      ".mdown",
      ".mdwn",
      ".mkd",
      ".mkdn",
      ".mkdown",
      ".ron",
      ".workbook"
    ],
    filenames: ["README"],
    tmScope: "source.gfm",
    linguistLanguageId: 222,
    vscodeLanguageIds: ["markdown"]
  },
  {
    name: "HTML",
    since: undefined, // unreleased
    parsers: ["parse5"],
    group: "HTML",
    tmScope: "text.html.basic",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    aliases: ["xhtml"],
    extensions: [".html", ".htm", ".html.hl", ".inc", ".st", ".xht", ".xhtml"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["html"]
  }
];

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
 * @property {(value: any) => boolean} exception
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
    exception: value =>
      typeof value === "string" || typeof value === "function",
    choices: [
      { value: "flow", description: "Flow" },
      { value: "babylon", description: "JavaScript" },
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

/**
 * @param {string} version
 * @param {{ showDeprecated?: boolean, showUnreleased?: boolean }?} opts
 */
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
  const languages = supportLanguages.filter(filterSince).map(language => {
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
  supportOptions,
  supportLanguages,
  getSupportInfo
};
