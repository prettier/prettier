"use strict";

const camelCase = require("camelcase");

const CATEGORY_CONFIG = "Config";
const CATEGORY_EDITOR = "Editor";
const CATEGORY_FORMAT = "Format";
const CATEGORY_OTHER = "Other";
const CATEGORY_OUTPUT = "Output";

const categoryOrder = [
  CATEGORY_OUTPUT,
  CATEGORY_FORMAT,
  CATEGORY_CONFIG,
  CATEGORY_EDITOR,
  CATEGORY_OTHER
];

/**
 * {
 *   [optionName]: {
 *     // The type of the option. For 'choice', see also `choices` below.
 *     // When passing a type other than the ones listed below, the option is
 *     // treated as taking any string as argument, and `--option <${type}>` will
 *     // be displayed in --help.
 *     type: "boolean" | "choice" | "int" | string;
 *
 *     // Default value to be passed to the minimist option `default`.
 *     default?: any;
 *
 *     // Alias name to be passed to the minimist option `alias`.
 *     alias?: string;
 *
 *     // For grouping options by category in --help.
 *     category?: string;
 *
 *     // Description to be displayed in --help. If omitted, the option won't be
 *     // shown at all in --help (but see also `oppositeDescription` below).
 *     description?: string;
 *
 *     // Description for `--no-${name}` to be displayed in --help. If omitted,
 *     // `--no-${name}` won't be shown.
 *     oppositeDescription?: string;
 *
 *     // Indicate if this option is simply passed to the API.
 *     // true: use camelified name as the API option name.
 *     // string: use this value as the API option name.
 *     forwardToApi?: boolean | string;
 *
 *     // Specify available choices for validation. They will also be displayed
 *     // in --help as <a|b|c>.
 *     // Use an object instead of a string if a choice is deprecated and should
 *     // be treated as `redirect` instead, or if you'd like to add description for
 *     // the choice.
 *     choices?: Array<
 *       | string
 *       | { value: string, description?: string, deprecated?: boolean, redirect?: string }
 *     >;
 *
 *     // If the option has a value that is an exception to the regular value
 *     // constraints, indicate that value here (or use a function for more
 *     // flexibility).
 *     exception?: any | ((value: any) => boolean);
 *
 *     // Indicate that the option is deprecated. Use a string to add an extra
 *     // message to --help for the option, for example to suggest a replacement
 *     // option.
 *     deprecated?: true | string;
 *
 *     // Custom function to get the value for the option. Useful for handling
 *     // deprecated options.
 *     // --parser example: (value, argv) => argv["flow-parser"] ? "flow" : value
 *     getter?: (value: any, argv: any) => any;
 *   }
 * }
 *
 * Note: The options below are sorted alphabetically.
 */
const detailedOptions = normalizeDetailedOptions({
  "bracket-spacing": {
    type: "boolean",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Print spaces between brackets.",
    oppositeDescription: "Do not print spaces between brackets."
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    type: "boolean",
    default: true,
    description: "Colorize error messages.",
    oppositeDescription: "Do not colorize error messages."
  },
  config: {
    type: "path",
    category: CATEGORY_CONFIG,
    description:
      "Path to a Prettier configuration file (.prettierrc, package.json, prettier.config.js).",
    oppositeDescription: "Do not look for a configuration file."
  },
  "config-precedence": {
    type: "choice",
    category: CATEGORY_CONFIG,
    default: "cli-override",
    choices: [
      {
        value: "cli-override",
        description: "CLI options take precedence over config file"
      },
      {
        value: "file-override",
        description: "Config file take precedence over CLI options"
      },
      {
        value: "prefer-file",
        description: dedent(`
          If a config file is found will evaluate it and ignore other CLI options.
          If no config file is found CLI options will evaluate as normal.
        `)
      }
    ],
    description:
      "Define in which order config files and CLI options should be evaluated."
  },
  "cursor-offset": {
    type: "int",
    category: CATEGORY_EDITOR,
    exception: -1,
    forwardToApi: true,
    description: dedent(`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end.
    `)
  },
  "debug-check": {
    type: "boolean"
  },
  "debug-print-doc": {
    type: "boolean"
  },
  "find-config-path": {
    type: "path",
    category: CATEGORY_CONFIG,
    description:
      "Find and print the path to a configuration file for the given input file."
  },
  "flow-parser": {
    // Deprecated in 0.0.10
    type: "boolean",
    category: CATEGORY_FORMAT,
    deprecated: "Use `--parser flow` instead."
  },
  help: {
    type: "flag",
    alias: "h",
    description: dedent(`
      Show CLI usage, or details about the given flag.
      Example: --help write
    `)
  },
  "ignore-path": {
    type: "path",
    category: CATEGORY_CONFIG,
    default: ".prettierignore",
    description: "Path to a file with patterns describing files to ignore."
  },
  "insert-pragma": {
    type: "boolean",
    forwardToApi: true,
    description: dedent(`
      Insert @format pragma into file's first docblock comment.
    `)
  },
  "jsx-bracket-same-line": {
    type: "boolean",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Put > on the last line instead of at a new line."
  },
  "list-different": {
    type: "boolean",
    category: CATEGORY_OUTPUT,
    alias: "l",
    description:
      "Print the names of files that are different from Prettier's formatting."
  },
  loglevel: {
    type: "choice",
    description: "What level of logs to report.",
    default: "warn",
    choices: ["silent", "error", "warn", "debug"]
  },
  parser: {
    type: "choice",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    exception: value => typeof value === "string", // Allow path to a parser module.
    choices: [
      "flow",
      "babylon",
      "typescript",
      "css",
      { value: "postcss", deprecated: true, redirect: "css" },
      "less",
      "scss",
      "json",
      "graphql",
      "markdown"
    ],
    description: "Which parser to use.",
    getter: (value, argv) => (argv["flow-parser"] ? "flow" : value)
  },
  "print-width": {
    type: "int",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "The line length where Prettier will try wrap."
  },
  "range-end": {
    type: "int",
    category: CATEGORY_EDITOR,
    forwardToApi: true,
    exception: Infinity,
    description: dedent(`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
    `)
  },
  "range-start": {
    type: "int",
    category: CATEGORY_EDITOR,
    forwardToApi: true,
    description: dedent(`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
    `)
  },
  "require-pragma": {
    type: "boolean",
    forwardToApi: true,
    description: dedent(`
      Require either '@prettier' or '@format' to be present in the file's first docblock comment
      in order for it to be formatted.
    `)
  },
  semi: {
    type: "boolean",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  "single-quote": {
    type: "boolean",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Use single quotes instead of double quotes."
  },
  stdin: {
    type: "boolean",
    description: "Force reading input from stdin."
  },
  "stdin-filepath": {
    type: "path",
    forwardToApi: "filepath",
    description: "Path to the file to pretend that stdin comes from."
  },
  "tab-width": {
    type: "int",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Number of spaces per indentation level."
  },
  "trailing-comma": {
    type: "choice",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
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
      { value: "", deprecated: true, redirect: "es5" }
    ],
    description: "Print trailing commas wherever possible when multi-line."
  },
  "use-tabs": {
    type: "boolean",
    category: CATEGORY_FORMAT,
    forwardToApi: true,
    description: "Indent with tabs instead of spaces."
  },
  version: {
    type: "boolean",
    alias: "v",
    description: "Print Prettier version."
  },
  "with-node-modules": {
    type: "boolean",
    category: CATEGORY_CONFIG,
    description: "Process files inside 'node_modules' directory."
  },
  write: {
    type: "boolean",
    category: CATEGORY_OUTPUT,
    description: "Edit files in-place. (Beware!)"
  }
});

const minimistOptions = {
  boolean: detailedOptions
    .filter(option => option.type === "boolean")
    .map(option => option.name),
  string: detailedOptions
    .filter(option => option.type !== "boolean")
    .map(option => option.name),
  default: detailedOptions
    .filter(option => option.default !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.default }, current),
      {}
    ),
  alias: detailedOptions
    .filter(option => option.alias !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.alias }, current),
      {}
    )
};

const usageSummary = `
Usage: prettier [options] [file/glob ...]

By default, output is written to stdout.
Stdin is read if it is piped to Prettier and no files are given.
`.trim();

function dedent(str) {
  const spaces = str.match(/\n^( +)/m)[1].length;
  return str.replace(new RegExp(`^ {${spaces}}`, "gm"), "").trim();
}

function normalizeDetailedOptions(rawDetailedOptions) {
  const names = Object.keys(rawDetailedOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailedOptions[name];
    return Object.assign({}, option, {
      name,
      category: option.category || CATEGORY_OTHER,
      forwardToApi:
        option.forwardToApi &&
        (typeof option.forwardToApi === "string"
          ? option.forwardToApi
          : camelCase(name)),
      choices:
        option.choices &&
        option.choices.map(choice =>
          Object.assign(
            { description: "", deprecated: false },
            typeof choice === "object" ? choice : { value: choice }
          )
        ),
      getter: option.getter || (value => value)
    });
  });

  return normalized;
}

const detailedOptionMap = detailedOptions.reduce(
  (current, option) => Object.assign(current, { [option.name]: option }),
  {}
);

module.exports = {
  categoryOrder,
  minimistOptions,
  detailedOptions,
  detailedOptionMap,
  usageSummary
};
