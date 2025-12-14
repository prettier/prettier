// Generated file, do NOT edit

import {
  languages as estreeLanguages,
  options as estreeOptions,
} from "../../../plugins/estree.js";
import { languages as glimmerLanguages } from "../../../plugins/glimmer.js";
import {
  languages as graphqlLanguages,
  options as graphqlOptions,
} from "../../../plugins/graphql.js";
import {
  languages as htmlLanguages,
  options as htmlOptions,
} from "../../../plugins/html.js";
import {
  languages as markdownLanguages,
  options as markdownOptions,
} from "../../../plugins/markdown.js";
import {
  languages as postcssLanguages,
  options as postcssOptions,
} from "../../../plugins/postcss.js";
import {
  languages as yamlLanguages,
  options as yamlOptions,
} from "../../../plugins/yaml.js";
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
  options: estreeOptions,
  languages: estreeLanguages,
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
  languages: glimmerLanguages,
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
  options: postcssOptions,
  languages: postcssLanguages,
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
