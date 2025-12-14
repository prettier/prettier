/*
Generated file, do NOT edit
Run `node scripts/generate-builtin-plugins.js` to regenerate
*/

import cssLanguages from "../../../language-css/languages.evaluate.js";
import cssOptions from "../../../language-css/options.js";
import graphqlLanguages from "../../../language-graphql/languages.evaluate.js";
import graphqlOptions from "../../../language-graphql/options.js";
import handlebarsLanguages from "../../../language-handlebars/languages.evaluate.js";
import htmlLanguages from "../../../language-html/languages.evaluate.js";
import htmlOptions from "../../../language-html/options.js";
import jsLanguages from "../../../language-js/languages.evaluate.js";
import jsOptions from "../../../language-js/options.js";
import jsonLanguages from "../../../language-json/languages.evaluate.js";
import markdownLanguages from "../../../language-markdown/languages.evaluate.js";
import markdownOptions from "../../../language-markdown/options.js";
import yamlLanguages from "../../../language-yaml/languages.evaluate.js";
import yamlOptions from "../../../language-yaml/options.js";
import { toLazyLoadPlugin } from "./utilities.js";

export const acorn = /* @__PURE__ */ toLazyLoadPlugin({
  name: "acorn",
  importPlugin: () => import("../../../plugins/acorn.js"),
  parserNames: ["acorn", "espree"],
});
export const angular = /* @__PURE__ */ toLazyLoadPlugin({
  name: "angular",
  importPlugin: () => import("../../../plugins/angular.js"),
  parserNames: [
    "__ng_action",
    "__ng_binding",
    "__ng_directive",
    "__ng_interpolation",
  ],
});
export const babel = /* @__PURE__ */ toLazyLoadPlugin({
  name: "babel",
  importPlugin: () => import("../../../plugins/babel.js"),
  parserNames: [
    "__babel_estree",
    "__js_expression",
    "__ts_expression",
    "__vue_event_binding",
    "__vue_expression",
    "__vue_ts_event_binding",
    "__vue_ts_expression",
    "babel",
    "babel-flow",
    "babel-ts",
    "json",
    "json-stringify",
    "json5",
    "jsonc",
  ],
});
export const estree = /* @__PURE__ */ toLazyLoadPlugin({
  name: "estree",
  importPlugin: () => import("../../../plugins/estree.js"),
  options: jsOptions,
  languages: [...jsonLanguages, ...jsLanguages],
  printerNames: ["estree", "estree-json"],
});
export const flow = /* @__PURE__ */ toLazyLoadPlugin({
  name: "flow",
  importPlugin: () => import("../../../plugins/flow.js"),
  parserNames: ["flow"],
});
export const glimmer = /* @__PURE__ */ toLazyLoadPlugin({
  name: "glimmer",
  importPlugin: () => import("../../../plugins/glimmer.js"),
  languages: handlebarsLanguages,
  parserNames: ["glimmer"],
  printerNames: ["glimmer"],
});
export const graphql = /* @__PURE__ */ toLazyLoadPlugin({
  name: "graphql",
  importPlugin: () => import("../../../plugins/graphql.js"),
  options: graphqlOptions,
  languages: graphqlLanguages,
  parserNames: ["graphql"],
  printerNames: ["graphql"],
});
export const html = /* @__PURE__ */ toLazyLoadPlugin({
  name: "html",
  importPlugin: () => import("../../../plugins/html.js"),
  options: htmlOptions,
  languages: htmlLanguages,
  parserNames: ["angular", "html", "lwc", "mjml", "vue"],
  printerNames: ["html"],
});
export const markdown = /* @__PURE__ */ toLazyLoadPlugin({
  name: "markdown",
  importPlugin: () => import("../../../plugins/markdown.js"),
  options: markdownOptions,
  languages: markdownLanguages,
  parserNames: ["markdown", "mdx", "remark"],
  printerNames: ["mdast"],
});
export const meriyah = /* @__PURE__ */ toLazyLoadPlugin({
  name: "meriyah",
  importPlugin: () => import("../../../plugins/meriyah.js"),
  parserNames: ["meriyah"],
});
export const postcss = /* @__PURE__ */ toLazyLoadPlugin({
  name: "postcss",
  importPlugin: () => import("../../../plugins/postcss.js"),
  options: cssOptions,
  languages: cssLanguages,
  parserNames: ["css", "less", "scss"],
  printerNames: ["postcss"],
});
export const typescript = /* @__PURE__ */ toLazyLoadPlugin({
  name: "typescript",
  importPlugin: () => import("../../../plugins/typescript.js"),
  parserNames: ["typescript"],
});
export const yaml = /* @__PURE__ */ toLazyLoadPlugin({
  name: "yaml",
  importPlugin: () => import("../../../plugins/yaml.js"),
  options: yamlOptions,
  languages: yamlLanguages,
  parserNames: ["yaml"],
  printerNames: ["yaml"],
});
