"use strict";

const dedent = require("dedent");
const dashify = require("dashify");
const getSupportInfo = require("./support").getSupportInfo;

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
const detailedOptions = normalizeDetailedOptions(
  Object.assign(
    getSupportInfo(null, { showDeprecated: true }).options.reduce(
      (reduced, option) => {
        const newOption = Object.assign({}, option, {
          name: dashify(option.name),
          forwardToApi: option.name,
          exception: option.default // for int = -1, Infinity, etc.
        });

        switch (option.name) {
          case "filepath":
            Object.assign(newOption, {
              name: "stdin-filepath",
              description: "Path to the file to pretend that stdin comes from."
            });
            break;
          case "useFlowParser":
            newOption.name = "flow-parser";
            break;
          case "parser":
            Object.assign(newOption, {
              exception: value => typeof value === "string", // Allow path to a parser module.
              getter: (value, argv) => (argv["flow-parser"] ? "flow" : value)
            });
            break;
        }

        switch (newOption.name) {
          case "cursor-offset":
          case "range-start":
          case "range-end":
            newOption.category = CATEGORY_EDITOR;
            break;
          case "stdin-filepath":
          case "insert-pragma":
          case "require-pragma":
            newOption.category = CATEGORY_OTHER;
            break;
          default:
            newOption.category = CATEGORY_FORMAT;
            break;
        }

        if (option.deprecated) {
          delete newOption.forwardToApi;
          delete newOption.description;
          delete newOption.oppositeDescription;
        }

        delete newOption.default;
        return Object.assign(reduced, { [newOption.name]: newOption });
      },
      {}
    ),
    {
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
            description: dedent`
              If a config file is found will evaluate it and ignore other CLI options.
              If no config file is found CLI options will evaluate as normal.
            `
          }
        ],
        description:
          "Define in which order config files and CLI options should be evaluated."
      },
      "debug-check": {
        type: "boolean"
      },
      "debug-print-doc": {
        type: "boolean"
      },
      editorconfig: {
        type: "boolean",
        category: CATEGORY_CONFIG,
        description:
          "Take .editorconfig into account when parsing configuration.",
        oppositeDescription:
          "Don't take .editorconfig into account when parsing configuration.",
        default: true
      },
      "find-config-path": {
        type: "path",
        category: CATEGORY_CONFIG,
        description:
          "Find and print the path to a configuration file for the given input file."
      },
      help: {
        type: "flag",
        alias: "h",
        description: dedent`
          Show CLI usage, or details about the given flag.
          Example: --help write
        `
      },
      "ignore-path": {
        type: "path",
        category: CATEGORY_CONFIG,
        default: ".prettierignore",
        description: "Path to a file with patterns describing files to ignore."
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
      stdin: {
        type: "boolean",
        description: "Force reading input from stdin."
      },
      "support-info": {
        type: "boolean",
        description: "Print support information as JSON."
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
    }
  )
);

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

const usageSummary = dedent`
  Usage: prettier [options] [file/glob ...]

  By default, output is written to stdout.
  Stdin is read if it is piped to Prettier and no files are given.
`;

function normalizeDetailedOptions(rawDetailedOptions) {
  const names = Object.keys(rawDetailedOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailedOptions[name];
    return Object.assign({}, option, {
      name,
      category: option.category || CATEGORY_OTHER,
      choices:
        option.choices &&
        option.choices.map(choice => {
          const newChoice = Object.assign(
            { description: "", deprecated: false },
            typeof choice === "object" ? choice : { value: choice }
          );
          if (newChoice.value === true) {
            newChoice.value = ""; // backward compability for original boolean option
          }
          return newChoice;
        }),
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
