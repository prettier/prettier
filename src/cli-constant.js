"use strict";

const booleanOptionNames = [
  "use-tabs",
  "semi",
  "single-quote",
  "bracket-spacing",
  "jsx-bracket-same-line",
  // Deprecated in 0.0.10
  "flow-parser"
];

const stringOptionNames = [
  "print-width",
  "tab-width",
  "parser",
  "trailing-comma"
];

const options = {
  boolean: [
    "write",
    "stdin",
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    "color",
    "list-different",
    "help",
    "version",
    "debug-print-doc",
    "debug-check",
    "with-node-modules"
  ].concat(booleanOptionNames),
  string: [
    "cursor-offset",
    "range-start",
    "range-end",
    "stdin-filepath",
    "config",
    "find-config-path",
    "ignore-path"
  ].concat(stringOptionNames),
  default: {
    color: true,
    "ignore-path": ".prettierignore"
  },
  alias: {
    help: "h",
    version: "v",
    "list-different": "l"
  },
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
  options,
  usage
};
