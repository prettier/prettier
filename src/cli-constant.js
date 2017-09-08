"use strict";

const normalizer = require("./cli-normalizer");

const options = normalizer.normalizeDetailOptions({
  "bracket-spacing": {
    type: "boolean",
    isFormatOption: true,
    isHidden: true
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    type: "boolean",
    default: true,
    isHidden: true
  },
  config: {
    type: "path",
    description:
      "Path to a prettier configuration file (.prettierrc, package.json, prettier.config.js)."
  },
  "config-precedence": {
    type: "choice",
    default: "cli-override",
    choices: ["cli-override", "file-override", "prefer-file"],
    description: dedent(`
      Defines how config file should be evaluated in combination of CLI options
      cli-override  | default config => config file => CLI options
      file-override | default config => CLI options => config file
      prefer-file   | default config => config file (if config file is found) or
                      default config => CLI options (if no config file is found)
      Defaults to cli-override
    `)
  },
  "cursor-offset": {
    type: "int",
    exception: -1,
    isFormatOption: true,
    description: dedent(`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end
    `)
  },
  "debug-check": {
    type: "boolean",
    isHidden: true
  },
  "debug-print-doc": {
    type: "boolean",
    isHidden: true
  },
  "find-config-path": {
    type: "path",
    description:
      "Finds and prints the path to a configuration file for a given input file."
  },
  "flow-parser": {
    // Deprecated in 0.0.10
    type: "boolean",
    isHidden: true,
    isFormatOption: true,
    deprecated: "Use `--parser flow` instead."
  },
  help: {
    type: "boolean",
    alias: "h",
    description: "Show help."
  },
  "ignore-path": {
    type: "path",
    default: ".prettierignore",
    description: dedent(`
      Path to a file containing patterns that describe files to ignore.
      Defaults to ./.prettierignore.
    `)
  },
  "jsx-bracket-same-line": {
    type: "boolean",
    isFormatOption: true,
    description: "Put > on the last line instead of at a new line."
  },
  "list-different": {
    type: "boolean",
    alias: "l",
    description:
      "Print filenames of files that are different from Prettier formatting."
  },
  "no-bracket-spacing": {
    type: "boolean",
    isDocsOnly: true,
    description: "Do not print spaces between brackets."
  },
  "no-color": {
    type: "boolean",
    isDocsOnly: true,
    description: "Do not colorize error messages."
  },
  "no-config": {
    type: "boolean",
    isDocsOnly: true,
    description: "Do not look for a configuration file."
  },
  "no-semi": {
    type: "boolean",
    isDocsOnly: true,
    description:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  parser: {
    type: "choice",
    exception: value => typeof value === "string",
    isFormatOption: true,
    choices: ["flow", "babylon", "typescript", "postcss", "json", "graphql"],
    description: "Specify which parse to use. Defaults to babylon.",
    getter: (value, argv) => (argv["flow-parser"] ? "flow" : value)
  },
  "print-width": {
    type: "int",
    isFormatOption: true,
    description:
      "Specify the length of line that the printer will wrap on. Defaults to 80."
  },
  "range-end": {
    type: "int",
    exception: Infinity,
    isFormatOption: true,
    description: dedent(`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
      Defaults to Infinity.
    `)
  },
  "range-start": {
    type: "int",
    isFormatOption: true,
    description: dedent(`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
      Defaults to 0.
    `)
  },
  semi: {
    type: "boolean",
    isFormatOption: true,
    isHidden: true
  },
  "single-quote": {
    type: "boolean",
    isFormatOption: true,
    description: "Use single quotes instead of double quotes."
  },
  stdin: {
    type: "boolean",
    description: "Read input from stdin."
  },
  "stdin-filepath": {
    type: "path",
    description: "Path to the file used to read from stdin."
  },
  "tab-width": {
    type: "int",
    isFormatOption: true,
    description:
      "Specify the number of spaces per indentation-level. Defaults to 2."
  },
  "trailing-comma": {
    type: "choice",
    isFormatOption: true,
    choices: [
      "none",
      "es5",
      "all",
      { value: "", deprecated: true, redirect: "es5" }
    ],
    description:
      "Print trailing commas wherever possible when multi-line. Defaults to none."
  },
  "use-tabs": {
    type: "boolean",
    isFormatOption: true,
    description: "Indent lines with tabs instead of spaces."
  },
  version: {
    type: "boolean",
    alias: "v",
    description: "Print Prettier version."
  },
  "with-node-modules": {
    type: "boolean",
    description: "Process files inside 'node_modules' directory."
  },
  write: {
    type: "boolean",
    description: "Edit the file in-place. (Beware!)"
  }
});

const booleanOptionNames = options
  .filter(option => option.isFormatOption && option.type === "boolean")
  .map(option => option.name);

const stringOptionNames = options
  .filter(option => option.isFormatOption && option.type !== "boolean")
  .map(option => option.name);

const minimistOptions = {
  boolean: options
    .filter(option => !option.isDocsOnly && option.type === "boolean")
    .map(option => option.name),
  string: options
    .filter(option => !option.isDocsOnly && option.type !== "boolean")
    .map(option => option.name),
  default: options
    .filter(option => option.default !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.default }, current),
      {}
    ),
  alias: options
    .filter(option => option.alias !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.alias }, current),
      {}
    ),
  unknown: param => {
    if (param.startsWith("-")) {
      console.warn(`Ignored unknown option: ${param}\n`);
      return false;
    }
  }
};

function dedent(str) {
  const spaces = str.match(/\n^( +)/m)[1].length;
  return str.replace(new RegExp(`^ {${spaces}}`, "gm"), "").trim();
}

module.exports = {
  booleanOptionNames,
  stringOptionNames,
  minimistOptions,
  options
};
