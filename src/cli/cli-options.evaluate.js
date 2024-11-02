import { outdent } from "outdent";
import { optionCategories } from "./prettier-internal.js";

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
 *     // Indicate that a CLI flag should be an array when forwarded to the API.
 *     array?: boolean;
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
 *     exception?: ((value: any) => boolean);
 *
 *     // Indicate that the option is deprecated. Use a string to add an extra
 *     // message to --help for the option, for example to suggest a replacement
 *     // option.
 *     deprecated?: true | string;
 *   }
 * }
 *
 * Note: The options below are sorted alphabetically.
 */
/* eslint sort-keys: "error" */
const options = {
  cache: {
    default: false,
    description: "Only format changed files. Cannot use with --stdin-filepath.",
    type: "boolean",
  },
  cacheLocation: {
    description: "Path to the cache file.",
    type: "path",
  },
  cacheStrategy: {
    choices: [
      {
        description: "Use the file metadata such as timestamps as cache keys",
        value: "metadata",
      },
      {
        description: "Use the file content as cache keys",
        value: "content",
      },
    ],
    description: "Strategy for the cache to use for detecting changed files.",
    type: "choice",
  },
  check: {
    alias: "c",
    category: optionCategories.CATEGORY_OUTPUT,
    description: outdent`
      Check if the given files are formatted, print a human-friendly summary
      message and paths to unformatted files (see also --list-different).
    `,
    type: "boolean",
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    default: true,
    description: "Colorize error messages.",
    oppositeDescription: "Do not colorize error messages.",
    type: "boolean",
  },
  config: {
    category: optionCategories.CATEGORY_CONFIG,
    description:
      "Path to a Prettier configuration file (.prettierrc, package.json, prettier.config.js).",
    exception: (value) => value === false,
    oppositeDescription: "Do not look for a configuration file.",
    type: "path",
  },
  configPrecedence: {
    category: optionCategories.CATEGORY_CONFIG,
    choices: [
      {
        description: "CLI options take precedence over config file",
        value: "cli-override",
      },
      {
        description: "Config file take precedence over CLI options",
        value: "file-override",
      },
      {
        description: outdent`
          If a config file is found will evaluate it and ignore other CLI options.
          If no config file is found CLI options will evaluate as normal.
        `,
        value: "prefer-file",
      },
    ],
    default: "cli-override",
    description:
      "Define in which order config files and CLI options should be evaluated.",
    type: "choice",
  },
  debugBenchmark: {
    // Run the formatting benchmarks. Requires 'benchmark' module to be installed.
    type: "boolean",
  },
  debugCheck: {
    // Run the formatting once again on the formatted output, throw if different.
    type: "boolean",
  },
  debugPrintAst: {
    type: "boolean",
  },
  debugPrintComments: {
    type: "boolean",
  },
  debugPrintDoc: {
    type: "boolean",
  },
  debugRepeat: {
    // Repeat the formatting a few times and measure the average duration.
    default: 0,
    type: "int",
  },
  editorconfig: {
    category: optionCategories.CATEGORY_CONFIG,
    default: true,
    description: "Take .editorconfig into account when parsing configuration.",
    oppositeDescription:
      "Don't take .editorconfig into account when parsing configuration.",
    type: "boolean",
  },
  errorOnUnmatchedPattern: {
    oppositeDescription: "Prevent errors when pattern is unmatched.",
    type: "boolean",
  },
  fileInfo: {
    description: outdent`
      Extract the following info (as JSON) for a given file path. Reported fields:
      * ignored (boolean) - true if file path is filtered by --ignore-path
      * inferredParser (string | null) - name of parser inferred from file path
    `,
    type: "path",
  },
  findConfigPath: {
    category: optionCategories.CATEGORY_CONFIG,
    description:
      "Find and print the path to a configuration file for the given input file.",
    type: "path",
  },
  help: {
    alias: "h",
    description: outdent`
      Show CLI usage, or details about the given flag.
      Example: --help write
    `,
    exception: (value) => value === "",
    type: "flag",
  },
  ignorePath: {
    array: true,
    category: optionCategories.CATEGORY_CONFIG,
    default: [{ value: [".gitignore", ".prettierignore"] }],
    description: outdent`
      Path to a file with patterns describing files to ignore.
      Multiple values are accepted.
    `,
    type: "path",
  },
  ignoreUnknown: {
    alias: "u",
    description: "Ignore unknown files.",
    type: "boolean",
  },
  listDifferent: {
    alias: "l",
    category: optionCategories.CATEGORY_OUTPUT,
    description:
      "Print the names of files that are different from Prettier's formatting (see also --check).",
    type: "boolean",
  },
  logLevel: {
    choices: ["silent", "error", "warn", "log", "debug"],
    default: "log",
    description: "What level of logs to report.",
    type: "choice",
  },
  supportInfo: {
    description: "Print support information as JSON.",
    type: "boolean",
  },
  version: {
    alias: "v",
    description: "Print Prettier version.",
    type: "boolean",
  },
  withNodeModules: {
    category: optionCategories.CATEGORY_CONFIG,
    description: "Process files inside 'node_modules' directory.",
    type: "boolean",
  },
  write: {
    alias: "w",
    category: optionCategories.CATEGORY_OUTPUT,
    description: "Edit files in-place. (Beware!)",
    type: "boolean",
  },
};

export default options;
