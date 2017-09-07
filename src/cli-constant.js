"use strict";

const _options = {
  write: {
    type: "boolean"
  },
  stdin: {
    type: "boolean"
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    type: "boolean",
    default: true
  },
  "list-different": {
    type: "boolean",
    alias: "l"
  },
  help: {
    type: "boolean",
    alias: "h"
  },
  version: {
    type: "boolean",
    alias: "v"
  },
  "debug-print-doc": {
    type: "boolean"
  },
  "debug-check": {
    type: "boolean"
  },
  "with-node-modules": {
    type: "boolean"
  },
  "flow-parser": {
    // Deprecated in 0.0.10
    type: "boolean",
    isFormatOption: true
  },
  "cursor-offset": {
    type: "int",
    isFormatOption: true
  },
  "range-start": {
    type: "int",
    isFormatOption: true
  },
  "range-end": {
    type: "int",
    isFormatOption: true
  },
  "stdin-filepath": {
    type: "string"
  },
  config: {
    type: "string"
  },
  "config-precedence": {
    type: "choice",
    default: "cli-override",
    choices: ["cli-override", "file-override", "prefer-file"]
  },
  "find-config-path": {
    type: "string"
  },
  "ignore-path": {
    type: "string",
    default: ".prettierignore"
  },
  "use-tabs": {
    type: "boolean",
    isFormatOption: true
  },
  semi: {
    type: "boolean",
    isFormatOption: true
  },
  "single-quote": {
    type: "boolean",
    isFormatOption: true
  },
  "bracket-spacing": {
    type: "boolean",
    isFormatOption: true
  },
  "jsx-bracket-same-line": {
    type: "boolean",
    isFormatOption: true
  },
  "print-width": {
    type: "int",
    isFormatOption: true
  },
  "tab-width": {
    type: "int",
    isFormatOption: true
  },
  parser: {
    type: "choice",
    isFormatOption: true,
    choices: ["flow", "babylon", "typescript", "postcss", "json", "graphql"]
  },
  "trailing-comma": {
    type: "choice",
    isFormatOption: true,
    choices: ["none", "es5", "all"]
  }
};

const _optionArray = Object.keys(_options).reduce(
  (current, name) => current.concat(Object.assign({ name }, _options[name])),
  []
);

const booleanOptionNames = _optionArray
  .filter(option => option.isFormatOption && option.type === "boolean")
  .map(option => option.name);

const stringOptionNames = _optionArray
  .filter(option => option.isFormatOption && option.type !== "boolean")
  .map(option => option.name);

const defaultOptions = {
  "bracket-spacing": true,
  semi: true,
  parser: "babylon"
};

const options = {
  boolean: _optionArray
    .filter(option => option.type === "boolean")
    .map(option => option.name),
  string: _optionArray
    .filter(option => option.type !== "boolean")
    .map(option => option.name),
  default: _optionArray
    .filter(option => option.default !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.default }, current),
      {}
    ),
  alias: _optionArray
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

const usage = `
Usage: prettier [opts] [filename ...]

Available options:
  --write                  Edit the file in-place. (Beware!)
  --list-different or -l   Print filenames of files that are different from Prettier formatting.
  --config                 Path to a prettier configuration file (.prettierrc, package.json, prettier.config.js).
  --config-precedence <cli-override|file-override|prefer-file>
                           Defines how config file should be evaluated in combination of CLI options
                           cli-override  | default config => config file => CLI options
                           file-override | default config => CLI options => config file
                           prefer-file   | default config => config file (if config file is found) or
                                           default config => CLI options (if no config file is found)
                           Defaults to cli-override
  --no-config              Do not look for a configuration file.
  --find-config-path <path>
                           Finds and prints the path to a configuration file for a given input file.
  --ignore-path <path>     Path to a file containing patterns that describe files to ignore.
                           Defaults to ./.prettierignore.
  --stdin                  Read input from stdin.
  --stdin-filepath         Path to the file used to read from stdin.
  --print-width <int>      Specify the length of line that the printer will wrap on. Defaults to 80.
  --tab-width <int>        Specify the number of spaces per indentation-level. Defaults to 2.
  --use-tabs               Indent lines with tabs instead of spaces.
  --no-semi                Do not print semicolons, except at the beginning of lines which may need them.
  --single-quote           Use single quotes instead of double quotes.
  --no-bracket-spacing     Do not print spaces between brackets.
  --jsx-bracket-same-line  Put > on the last line instead of at a new line.
  --trailing-comma <none|es5|all>
                           Print trailing commas wherever possible when multi-line. Defaults to none.
  --parser <flow|babylon|typescript|postcss|json|graphql>
                           Specify which parse to use. Defaults to babylon.
  --cursor-offset <int>    Print (to stderr) where a cursor at the given position would move to after formatting.
                           This option cannot be used with --range-start and --range-end
  --range-start <int>      Format code starting at a given character offset.
                           The range will extend backwards to the start of the first line containing the selected statement.
                           This option cannot be used with --cursor-offset.
                           Defaults to 0.
  --range-end <int>        Format code ending at a given character offset (exclusive).
                           The range will extend forwards to the end of the selected statement.
                           This option cannot be used with --cursor-offset.
                           Defaults to Infinity.
  --no-color               Do not colorize error messages.
  --with-node-modules      Process files inside 'node_modules' directory.
  --version or -v          Print Prettier version.

`.slice(1); // remove leading line break

module.exports = {
  booleanOptionNames,
  stringOptionNames,
  defaultOptions,
  options,
  usage
};
