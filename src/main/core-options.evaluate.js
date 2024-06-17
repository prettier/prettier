import { outdent } from "outdent";

import {
  CATEGORY_CONFIG,
  CATEGORY_EDITOR,
  CATEGORY_GLOBAL,
  CATEGORY_OTHER,
  CATEGORY_SPECIAL,
} from "./option-categories.js";

/**
 * @typedef {Object} OptionInfo
 * @property {string} category
 * @property {'int' | 'boolean' | 'choice' | 'path' | 'string' | 'flag'} type
 * @property {boolean} [array] - indicate it's an array of the specified type
 * @property {OptionValueInfo} [default]
 * @property {OptionRangeInfo} [range] - for type int
 * @property {string} description
 * @property {string} [deprecated] - deprecated since version
 * @property {OptionRedirectInfo | string} [redirect] - redirect deprecated option
 * @property {(value: any) => boolean} [exception]
 * @property {OptionChoiceInfo[]} [choices] - for type choice
 * @property {string} [cliName]
 * @property {string} [cliCategory]
 * @property {string} [cliDescription]
 *
 * @typedef {number | boolean | string | []} OptionValue
 * @typedef {OptionValue | [{ value: OptionValue }]} OptionValueInfo
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
 * @property {string} description
 * @property {string} [deprecated] - deprecated since version
 * @property {OptionValueInfo} [redirect] - redirect deprecated value
 */

/** @type {{ [name: string]: OptionInfo }} */
const options = {
  cursorOffset: {
    category: CATEGORY_SPECIAL,
    type: "int",
    default: -1,
    range: { start: -1, end: Number.POSITIVE_INFINITY, step: 1 },
    description:
      "Print (to stderr) where a cursor at the given position would move to after formatting.",
    cliCategory: CATEGORY_EDITOR,
  },
  endOfLine: {
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: "lf",
    description: "Which end of line characters to apply.",
    choices: [
      {
        value: "lf",
        description: String.raw`Line Feed only (\n), common on Linux and macOS as well as inside git repos`,
      },
      {
        value: "crlf",
        description: String.raw`Carriage Return + Line Feed characters (\r\n), common on Windows`,
      },
      {
        value: "cr",
        description: String.raw`Carriage Return character only (\r), used very rarely`,
      },
      {
        value: "auto",
        description: outdent`
          Maintain existing
          (mixed values within one file are normalised by looking at what's used after the first line)
        `,
      },
    ],
  },
  filepath: {
    category: CATEGORY_SPECIAL,
    type: "path",
    description:
      "Specify the input filepath. This will be used to do parser inference.",
    cliName: "stdin-filepath",
    cliCategory: CATEGORY_OTHER,
    cliDescription: "Path to the file to pretend that stdin comes from.",
  },
  insertPragma: {
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: "Insert @format pragma into file's first docblock comment.",
    cliCategory: CATEGORY_OTHER,
  },
  parser: {
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: undefined,
    description: "Which parser to use.",
    exception: (value) =>
      typeof value === "string" || typeof value === "function",
    choices: [
      { value: "flow", description: "Flow" },
      { value: "babel", description: "JavaScript" },
      { value: "babel-flow", description: "Flow" },
      { value: "babel-ts", description: "TypeScript" },
      { value: "typescript", description: "TypeScript" },
      { value: "acorn", description: "JavaScript" },
      { value: "espree", description: "JavaScript" },
      { value: "meriyah", description: "JavaScript" },
      { value: "css", description: "CSS" },
      { value: "less", description: "Less" },
      { value: "scss", description: "SCSS" },
      { value: "json", description: "JSON" },
      { value: "json5", description: "JSON5" },
      { value: "jsonc", description: "JSON with Comments" },
      { value: "json-stringify", description: "JSON.stringify" },
      { value: "graphql", description: "GraphQL" },
      { value: "markdown", description: "Markdown" },
      { value: "mdx", description: "MDX" },
      { value: "vue", description: "Vue" },
      { value: "yaml", description: "YAML" },
      { value: "glimmer", description: "Ember / Handlebars" },
      { value: "html", description: "HTML" },
      { value: "angular", description: "Angular" },
      { value: "lwc", description: "Lightning Web Components" },
    ],
  },
  plugins: {
    type: "path",
    array: true,
    default: [{ value: [] }],
    category: CATEGORY_GLOBAL,
    description:
      "Add a plugin. Multiple plugins can be passed as separate `--plugin`s.",
    exception: (value) =>
      typeof value === "string" || typeof value === "object",
    cliName: "plugin",
    cliCategory: CATEGORY_CONFIG,
  },
  printWidth: {
    category: CATEGORY_GLOBAL,
    type: "int",
    default: 80,
    description: "The line length where Prettier will try wrap.",
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 },
  },
  rangeEnd: {
    category: CATEGORY_SPECIAL,
    type: "int",
    default: Number.POSITIVE_INFINITY,
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 },
    description: outdent`
      Format code ending at a given character offset (exclusive).
      The range will extend forwards to the end of the selected statement.
    `,
    cliCategory: CATEGORY_EDITOR,
  },
  rangeStart: {
    category: CATEGORY_SPECIAL,
    type: "int",
    default: 0,
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 },
    description: outdent`
      Format code starting at a given character offset.
      The range will extend backwards to the start of the first line containing the selected statement.
    `,
    cliCategory: CATEGORY_EDITOR,
  },
  requirePragma: {
    category: CATEGORY_SPECIAL,
    type: "boolean",
    default: false,
    description: outdent`
      Require either '@prettier' or '@format' to be present in the file's first docblock comment
      in order for it to be formatted.
    `,
    cliCategory: CATEGORY_OTHER,
  },
  tabWidth: {
    type: "int",
    category: CATEGORY_GLOBAL,
    default: 2,
    description: "Number of spaces per indentation level.",
    range: { start: 0, end: Number.POSITIVE_INFINITY, step: 1 },
  },
  useTabs: {
    category: CATEGORY_GLOBAL,
    type: "boolean",
    default: false,
    description: "Indent with tabs instead of spaces.",
  },
  embeddedLanguageFormatting: {
    category: CATEGORY_GLOBAL,
    type: "choice",
    default: "auto",
    description:
      "Control how Prettier formats quoted code embedded in the file.",
    choices: [
      {
        value: "auto",
        description:
          "Format embedded code if Prettier can automatically identify it.",
      },
      {
        value: "off",
        description: "Never automatically format embedded code.",
      },
    ],
  },
};

export default options;
