/*
Generated file, do NOT edit
Run `node scripts/generate-builtin-plugins.js` to regenerate
*/

import {
  languages as cssLanguages,
  options as cssOptions,
} from "../../../language-css/index.js";
import {
  languages as graphqlLanguages,
  options as graphqlOptions,
} from "../../../language-graphql/index.js";
import { languages as handlebarsLanguages } from "../../../language-handlebars/index.js";
import {
  languages as htmlLanguages,
  options as htmlOptions,
} from "../../../language-html/index.js";
import {
  languages as jsLanguages,
  options as jsOptions,
} from "../../../language-js/index.js";
import { languages as jsonLanguages } from "../../../language-json/index.js";
import {
  languages as markdownLanguages,
  options as markdownOptions,
} from "../../../language-markdown/index.js";
import {
  languages as yamlLanguages,
  options as yamlOptions,
} from "../../../language-yaml/index.js";
import { toLazyLoadPlugin } from "./utilities.js";

export const css = /* @__PURE__ */ toLazyLoadPlugin({
  name: "css",
  importPlugin: () => import("../../../language-css/index.js"),
  options: cssOptions,
  languages: cssLanguages,
  parserNames: ["css", "less", "scss"],
  printerNames: ["postcss"],
});
export const graphql = /* @__PURE__ */ toLazyLoadPlugin({
  name: "graphql",
  importPlugin: () => import("../../../language-graphql/index.js"),
  options: graphqlOptions,
  languages: graphqlLanguages,
  parserNames: ["graphql"],
  printerNames: ["graphql"],
});
export const handlebars = /* @__PURE__ */ toLazyLoadPlugin({
  name: "handlebars",
  importPlugin: () => import("../../../language-handlebars/index.js"),
  languages: handlebarsLanguages,
  parserNames: ["glimmer"],
  printerNames: ["glimmer"],
});
export const html = /* @__PURE__ */ toLazyLoadPlugin({
  name: "html",
  importPlugin: () => import("../../../language-html/index.js"),
  options: htmlOptions,
  languages: htmlLanguages,
  parserNames: ["angular", "html", "lwc", "mjml", "vue"],
  printerNames: ["html"],
});
export const js = /* @__PURE__ */ toLazyLoadPlugin({
  name: "js",
  importPlugin: () => import("../../../language-js/index.js"),
  options: jsOptions,
  languages: jsLanguages,
  parserNames: [
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
  importPlugin: () => import("../../../language-js/index.js"),
  printerNames: ["estree"],
});
export const json = /* @__PURE__ */ toLazyLoadPlugin({
  name: "json",
  importPlugin: () => import("../../../language-json/index.js"),
  languages: jsonLanguages,
  parserNames: ["json", "json-stringify", "json5", "jsonc"],
  printerNames: ["estree", "estree-json"],
});
export const markdown = /* @__PURE__ */ toLazyLoadPlugin({
  name: "markdown",
  importPlugin: () => import("../../../language-markdown/index.js"),
  options: markdownOptions,
  languages: markdownLanguages,
  parserNames: ["markdown", "mdx", "remark"],
  printerNames: ["mdast"],
});
export const yaml = /* @__PURE__ */ toLazyLoadPlugin({
  name: "yaml",
  importPlugin: () => import("../../../language-yaml/index.js"),
  options: yamlOptions,
  languages: yamlLanguages,
  parserNames: ["yaml"],
  printerNames: ["yaml"],
});
