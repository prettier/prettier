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
  load: () => import("../../../plugins/acorn.js"),
  parsers: ["acorn", "espree"],
});
export const angular = /* @__PURE__ */ toLazyLoadPlugin({
  name: "angular",
  load: () => import("../../../plugins/angular.js"),
  parsers: [
    "__ng_action",
    "__ng_binding",
    "__ng_directive",
    "__ng_interpolation",
  ],
});
export const babel = /* @__PURE__ */ toLazyLoadPlugin({
  name: "babel",
  load: () => import("../../../plugins/babel.js"),
  parsers: [
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
  load: () => import("../../../plugins/estree.js"),
  options: jsOptions,
  languages: [...jsonLanguages, ...jsLanguages],
  printers: ["estree", "estree-json"],
});
export const flow = /* @__PURE__ */ toLazyLoadPlugin({
  name: "flow",
  load: () => import("../../../plugins/flow.js"),
  parsers: ["flow"],
});
export const glimmer = /* @__PURE__ */ toLazyLoadPlugin({
  name: "glimmer",
  load: () => import("../../../plugins/glimmer.js"),
  languages: handlebarsLanguages,
  parsers: ["glimmer"],
  printers: ["glimmer"],
});
export const graphql = /* @__PURE__ */ toLazyLoadPlugin({
  name: "graphql",
  load: () => import("../../../plugins/graphql.js"),
  options: graphqlOptions,
  languages: graphqlLanguages,
  parsers: ["graphql"],
  printers: ["graphql"],
});
export const html = /* @__PURE__ */ toLazyLoadPlugin({
  name: "html",
  load: () => import("../../../plugins/html.js"),
  options: htmlOptions,
  languages: htmlLanguages,
  parsers: ["angular", "html", "lwc", "mjml", "vue"],
  printers: ["html"],
});
export const markdown = /* @__PURE__ */ toLazyLoadPlugin({
  name: "markdown",
  load: () => import("../../../plugins/markdown.js"),
  options: markdownOptions,
  languages: markdownLanguages,
  parsers: ["markdown", "mdx", "remark"],
  printers: ["mdast"],
});
export const meriyah = /* @__PURE__ */ toLazyLoadPlugin({
  name: "meriyah",
  load: () => import("../../../plugins/meriyah.js"),
  parsers: ["meriyah"],
});
export const postcss = /* @__PURE__ */ toLazyLoadPlugin({
  name: "postcss",
  load: () => import("../../../plugins/postcss.js"),
  options: cssOptions,
  languages: cssLanguages,
  parsers: ["css", "less", "scss"],
  printers: ["postcss"],
});
export const typescript = /* @__PURE__ */ toLazyLoadPlugin({
  name: "typescript",
  load: () => import("../../../plugins/typescript.js"),
  parsers: ["typescript"],
});
export const yaml = /* @__PURE__ */ toLazyLoadPlugin({
  name: "yaml",
  load: () => import("../../../plugins/yaml.js"),
  options: yamlOptions,
  languages: yamlLanguages,
  parsers: ["yaml"],
  printers: ["yaml"],
});
