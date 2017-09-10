"use strict";

/**
 * {
 *   [name]: {
 *     // non-boolean will be treated as string to be passed in minimist
 *     // and also be displayed in usage as `--option <type>` except `choice`
 *     // there is also additional check for 'choice' (see `choices`) and 'int'
 *     type: 'boolean' | 'choice' | 'int' | string;
 *     
 *     // default value to be passed in minimist option `default`
 *     default?: any;
 *  
 *     // alias name to be passed in minimist option `alias`
 *     alias?: string;
 * 
 *     // not to be displayed in usage
 *     hidden?: boolean;
 * 
 *     // for categorizing option in usage
 *     category?: string; 
 *     
 *     // description to be displayed in usage
 *     description?: string;
 * 
 *     // description for its no-option (`no-${name}`) to be displayed in usage
 *     oppositeDescription?: string;
 *     
 *     // indicate if this option is also used for api
 *     // true: use camelified name as api key
 *     // string: use this value as api key
 *     forwardToApi?: boolean | string;
 *     
 *     // specify available choices, and will be also displayed in usage as <a|b|c>
 *     // use object choice if it's a deprecated value and should be treated as `redirect`
 *     choices?: Array<string | { value: string, deprecated: boolean, redirect: string }>;
 *     
 *     // an exception value or function to indicate if the value is an exception
 *     // exception value will not be checked regardless of any constraint
 *     exception?: any | ((value: any) => boolean);
 *     
 *     // function to get its value, usually use for deprecated option
 *     // `--parser` for example: (value, argv) => argv["flow-parser"] ? "flow" : value
 *     getter?: (value: any, argv: any) => any;
 *   }
 * }
 */
const detailOptions = normalizeDetailOptions({
  "bracket-spacing": {
    type: "boolean",
    category: "format",
    forwardToApi: true,
    oppositeDescription: "Do not print spaces between brackets.",
    hidden: true
  },
  color: {
    // The supports-color package (a sub sub dependency) looks directly at
    // `process.argv` for `--no-color` and such-like options. The reason it is
    // listed here is to avoid "Ignored unknown option: --no-color" warnings.
    // See https://github.com/chalk/supports-color/#info for more information.
    type: "boolean",
    default: true,
    hidden: true,
    oppositeDescription: "Do not colorize error messages."
  },
  config: {
    type: "path",
    category: "config",
    description:
      "Path to a prettier configuration file (.prettierrc, package.json, prettier.config.js).",
    oppositeDescription: "Do not look for a configuration file."
  },
  "config-precedence": {
    type: "choice",
    category: "config",
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
    forwardToApi: true,
    description: dedent(`
      Print (to stderr) where a cursor at the given position would move to after formatting.
      This option cannot be used with --range-start and --range-end
    `)
  },
  "debug-check": {
    type: "boolean",
    hidden: true
  },
  "debug-print-doc": {
    type: "boolean",
    hidden: true
  },
  "find-config-path": {
    type: "path",
    category: "command",
    description:
      "Finds and prints the path to a configuration file for a given input file."
  },
  "flow-parser": {
    // Deprecated in 0.0.10
    type: "boolean",
    category: "format",
    hidden: true,
    deprecated: "Use `--parser flow` instead."
  },
  help: {
    type: "boolean",
    category: "command",
    alias: "h",
    description: "Show help."
  },
  "ignore-path": {
    type: "path",
    category: "config",
    default: ".prettierignore",
    description: dedent(`
      Path to a file containing patterns that describe files to ignore.
      Defaults to ./.prettierignore.
    `)
  },
  "jsx-bracket-same-line": {
    type: "boolean",
    category: "format",
    forwardToApi: true,
    description: "Put > on the last line instead of at a new line."
  },
  "list-different": {
    type: "boolean",
    category: "command",
    alias: "l",
    description:
      "Print filenames of files that are different from Prettier formatting."
  },
  parser: {
    type: "choice",
    category: "format",
    forwardToApi: true,
    exception: value => typeof value === "string", // allow path to a parser module
    choices: ["flow", "babylon", "typescript", "postcss", "json", "graphql"],
    description: "Specify which parse to use. Defaults to babylon.",
    getter: (value, argv) => (argv["flow-parser"] ? "flow" : value)
  },
  "print-width": {
    type: "int",
    category: "format",
    forwardToApi: true,
    description:
      "Specify the length of line that the printer will wrap on. Defaults to 80."
  },
  "range-end": {
    type: "int",
    category: "format",
    forwardToApi: true,
    exception: Infinity,
    description: dedent(`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
      This option cannot be used with --cursor-offset.
      Defaults to Infinity.
    `)
  },
  "range-start": {
    type: "int",
    category: "format",
    forwardToApi: true,
    description: dedent(`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
      This option cannot be used with --cursor-offset.
      Defaults to 0.
    `)
  },
  semi: {
    type: "boolean",
    category: "format",
    forwardToApi: true,
    hidden: true,
    oppositeDescription:
      "Do not print semicolons, except at the beginning of lines which may need them."
  },
  "single-quote": {
    type: "boolean",
    category: "format",
    forwardToApi: true,
    description: "Use single quotes instead of double quotes."
  },
  stdin: {
    type: "boolean",
    description: "Read input from stdin."
  },
  "stdin-filepath": {
    type: "path",
    forwardToApi: "filepath",
    description: "Path to the file used to read from stdin."
  },
  "tab-width": {
    type: "int",
    category: "format",
    forwardToApi: true,
    description:
      "Specify the number of spaces per indentation-level. Defaults to 2."
  },
  "trailing-comma": {
    type: "choice",
    category: "format",
    forwardToApi: true,
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
    category: "format",
    forwardToApi: true,
    description: "Indent lines with tabs instead of spaces."
  },
  version: {
    type: "boolean",
    category: "command",
    alias: "v",
    description: "Print Prettier version."
  },
  "with-node-modules": {
    type: "boolean",
    category: "config",
    description: "Process files inside 'node_modules' directory."
  },
  write: {
    type: "boolean",
    category: "command",
    description: "Edit the file in-place. (Beware!)"
  }
});

const minimistOptions = {
  boolean: detailOptions
    .filter(option => option.type === "boolean")
    .map(option => option.name),
  string: detailOptions
    .filter(option => option.type !== "boolean")
    .map(option => option.name),
  default: detailOptions
    .filter(option => option.default !== undefined)
    .reduce(
      (current, option) =>
        Object.assign({ [option.name]: option.default }, current),
      {}
    ),
  alias: detailOptions
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

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

function normalizeDetailOptions(rawDetailOptions) {
  const names = Object.keys(rawDetailOptions).sort();

  const normalized = names.map(name => {
    const option = rawDetailOptions[name];
    return Object.assign({}, option, {
      name,
      category: option.category || "other",
      forwardToApi:
        option.forwardToApi &&
        (typeof option.forwardToApi === "string"
          ? option.forwardToApi
          : kebabToCamel(name)),
      choices:
        option.choices &&
        option.choices.map(
          choice => (typeof choice === "object" ? choice : { value: choice })
        ),
      getter: option.getter || (value => value)
    });
  });

  normalized.forEach(normalizedOption => {
    normalized[normalizedOption.name] = normalizedOption;
  });

  return normalized;
}

module.exports = {
  minimistOptions,
  detailOptions
};
