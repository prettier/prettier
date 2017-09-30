"use strict";

const categories = require("./options-categories").categories;

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
module.exports = {
  "bracket-spacing": {
    type: "boolean",
    category: categories.FORMAT,
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
    category: categories.CONFIG,
    description:
      "Path to a Prettier configuration file (.prettierrc, package.json, prettier.config.js).",
    oppositeDescription: "Do not look for a configuration file."
  },
  "config-precedence": {
    type: "choice",
    category: categories.CONFIG,
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
    category: categories.EDITOR,
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
    category: categories.CONFIG,
    description:
      "Find and print the path to a configuration file for the given input file."
  },
  "flow-parser": {
    // Deprecated in 0.0.10
    type: "boolean",
    category: categories.FORMAT,
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
    category: categories.CONFIG,
    default: ".prettierignore",
    description: "Path to a file with patterns describing files to ignore."
  },
  "jsx-bracket-same-line": {
    type: "boolean",
    category: categories.FORMAT,
    forwardToApi: true,
    description: "Put > on the last line instead of at a new line."
  },
  "list-different": {
    type: "boolean",
    category: categories.OUTPUT,
    alias: "l",
    description:
      "Print the names of files that are different from Prettier's formatting."
  },
  /**
   * Both the `babylon` and `flow` parsers support the same set of JavaScript
   * features (including Flow). Prettier automatically infers the parser from the
   * input file path, so you shouldn't have to change this setting.
   */
  parser: {
    type: "choice",
    category: categories.FORMAT,
    forwardToApi: true,
    exception: value => typeof value === "string", // Allow path to a parser module.
    choices: [
      { value: "flow", description: "https://github.com/facebook/flow" },
      { value: "babylon", description: "https://github.com/babel/babylon" },
      {
        value: "typescript",
        description: "https://github.com/eslint/typescript-eslint-parser"
      },
      {
        value: "css",
        description: "scientifically try both postcss-less and postcss-scss"
      },
      { value: "postcss", deprecated: true, redirect: "css" },
      {
        value: "less",
        description: "https://github.com/shellscape/postcss-less"
      },
      { value: "scss", description: "https://github.com/postcss/postcss-scss" },
      { value: "json", description: "https://github.com/babel/babylon" },
      {
        value: "graphql",
        description: "https://github.com/graphql/graphql-js"
      }
    ],
    description: "Which parser to use.",
    getter: (value, argv) => (argv["flow-parser"] ? "flow" : value)
  },
  /**
   * > **For readability we recommend against using more than 80 characters:**
   * >
   * > In code styleguides, maximum line length rules are often set to 100 or 120.
   * > However, when humans write code, they don't strive to reach the maximum
   * > number of columns on every line. Developers often use whitespace to break
   * > up long lines for readability. In practice, the average line length often
   * > ends up well below the maximum.
   * >
   * > Prettier, on the other hand, strives to fit the most code into every line.
   * > With the print width set to 120, prettier may produce overly compact, or
   * > otherwise undesirable code.
   */
  "print-width": {
    type: "int",
    category: categories.FORMAT,
    forwardToApi: true,
    description: "The line length where Prettier will try wrap."
  },
  "range-end": {
    type: "int",
    category: categories.EDITOR,
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
    category: categories.EDITOR,
    forwardToApi: true,
    description: dedent(`
        Format code starting at a given character offset.
        The range will extend backwards to the start of the first line containing the selected statement.
        This option cannot be used with --cursor-offset.
      `)
  },
  /**
   * Prettier can restrict itself to only format files that contain a special
   * comment, called a pragma, at the top of the file. This is very useful
   * when gradually transitioning large, unformatted codebases to prettier.
   *
   * For example, a file with the following as its first comment will be
   * formatted when `--require-pragma` is supplied:
   *
   * ```js
   * /**
   *  * @prettier
   *  *\/
   * ````
   *
   *     or
   *
   * ```js
   * /**
   *  * @format
   *  *\/
   * ```
   */
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
    category: categories.FORMAT,
    forwardToApi: true,
    description: "Print semicolons.",
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  /**
   * Notes:
   * - Quotes in JSX will always be double and ignore this setting.
   * - If the number of quotes outweighs the other quote, the quote which is
   *   less used will be used to format the string -
   *   Example: `"I'm double quoted"` results in `"I'm double quoted"` and
   *   `"This \"example\" is single quoted"` results in `'This "example" is
   *   single quoted'`.
   */
  "single-quote": {
    type: "boolean",
    category: categories.FORMAT,
    forwardToApi: true,
    description: "Use single quotes instead of double quotes."
  },
  stdin: {
    type: "boolean",
    description: "Force reading input from stdin."
  },
  /**
   * For example, the following will use `postcss` parser:
   *
   * ```bash
   * cat foo | prettier --stdin-filepath foo.css
   * ```
   */
  "stdin-filepath": {
    type: "path",
    forwardToApi: "filepath",
    description: "Path to the file to pretend that stdin comes from."
  },
  "tab-width": {
    type: "int",
    category: categories.FORMAT,
    forwardToApi: true,
    description: "Number of spaces per indentation level."
  },
  "trailing-comma": {
    type: "choice",
    category: categories.FORMAT,
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
    category: categories.FORMAT,
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
    category: categories.CONFIG,
    description: "Process files inside 'node_modules' directory."
  },
  write: {
    type: "boolean",
    category: categories.OUTPUT,
    description: "Edit files in-place. (Beware!)"
  }
};

function dedent(str) {
  const spaces = str.match(/\n^( +)/m)[1].length;
  return str.replace(new RegExp(`^ {${spaces}}`, "gm"), "").trim();
}
