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

export const css = /* @__PURE__ */ toLazyLoadPlugin({
  name: "css",
  load: () => import("../../../language-css/index.js"),
  options: cssOptions,
  languages: cssLanguages,
  parsers: ["css", "less", "scss"],
  printers: ["postcss"],
});
export const graphql = /* @__PURE__ */ toLazyLoadPlugin({
  name: "graphql",
  load: () => import("../../../language-graphql/index.js"),
  options: graphqlOptions,
  languages: graphqlLanguages,
  parsers: ["graphql"],
  printers: ["graphql"],
});
export const handlebars = /* @__PURE__ */ toLazyLoadPlugin({
  name: "handlebars",
  load: () => import("../../../language-handlebars/index.js"),
  languages: handlebarsLanguages,
  parsers: ["glimmer"],
  printers: ["glimmer"],
});
export const html = /* @__PURE__ */ toLazyLoadPlugin({
  name: "html",
  load: () => import("../../../language-html/index.js"),
  options: htmlOptions,
  languages: htmlLanguages,
  parsers: ["angular", "html", "lwc", "mjml", "vue"],
  printers: ["html"],
});
export const js = /* @__PURE__ */ toLazyLoadPlugin({
  name: "js",
  load: () => import("../../../language-js/index.js"),
  options: jsOptions,
  languages: jsLanguages,
  parsers: [
    "__babel_estree",
    "__js_expression",
    "__ng_action",
    "__ng_binding",
    "__ng_directive",
    "__ng_interpolation",
    "__ts_expression",
    "__vue_event_binding",
    "__vue_expression",
    "__vue_ts_event_binding",
    "__vue_ts_expression",
    "acorn",
    "babel",
    "babel-flow",
    "babel-ts",
    "espree",
    "flow",
    "hermes",
    "meriyah",
    "oxc",
    "oxc-ts",
    "typescript",
  ],
});
export const estree = /* @__PURE__ */ toLazyLoadPlugin({
  name: "estree",
  load: () => import("../../../language-js/index.js"),
  printers: ["estree"],
});
export const json = /* @__PURE__ */ toLazyLoadPlugin({
  name: "json",
  load: () => import("../../../language-json/index.js"),
  languages: jsonLanguages,
  parsers: ["json", "json-stringify", "json5", "jsonc"],
  printers: ["estree", "estree-json"],
});
export const markdown = /* @__PURE__ */ toLazyLoadPlugin({
  name: "markdown",
  load: () => import("../../../language-markdown/index.js"),
  options: markdownOptions,
  languages: markdownLanguages,
  parsers: ["markdown", "mdx", "remark"],
  printers: ["mdast"],
});
export const yaml = /* @__PURE__ */ toLazyLoadPlugin({
  name: "yaml",
  load: () => import("../../../language-yaml/index.js"),
  options: yamlOptions,
  languages: yamlLanguages,
  parsers: ["yaml"],
  printers: ["yaml"],
});
