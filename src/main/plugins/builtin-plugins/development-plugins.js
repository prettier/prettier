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
import { toLazyLoadPlugins } from "./utilities.js";

export const plugins = /* @__PURE__ */ toLazyLoadPlugins(
  {
    name: "css",
    load: () => import("../../../language-css/index.js"),
    options: cssOptions,
    languages: cssLanguages,
    parsers: ["css", "less", "scss"],
    printers: ["postcss"],
  },
  {
    name: "graphql",
    load: () => import("../../../language-graphql/index.js"),
    options: graphqlOptions,
    languages: graphqlLanguages,
    parsers: ["graphql"],
    printers: ["graphql"],
  },
  {
    name: "handlebars",
    load: () => import("../../../language-handlebars/index.js"),
    languages: handlebarsLanguages,
    parsers: ["glimmer"],
    printers: ["glimmer"],
  },
  {
    name: "html",
    load: () => import("../../../language-html/index.js"),
    options: htmlOptions,
    languages: htmlLanguages,
    parsers: ["angular", "html", "lwc", "mjml", "vue"],
    printers: ["html"],
  },
  {
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
  },
  {
    name: "estree",
    load: () => import("../../../language-js/index.js"),
    printers: ["estree"],
  },
  {
    name: "json",
    load: () => import("../../../language-json/index.js"),
    languages: jsonLanguages,
    parsers: ["json", "json-stringify", "json5", "jsonc"],
    printers: ["estree", "estree-json"],
  },
  {
    name: "markdown",
    load: () => import("../../../language-markdown/index.js"),
    options: markdownOptions,
    languages: markdownLanguages,
    parsers: ["markdown", "mdx", "remark"],
    printers: ["mdast"],
  },
  {
    name: "yaml",
    load: () => import("../../../language-yaml/index.js"),
    options: yamlOptions,
    languages: yamlLanguages,
    parsers: ["yaml"],
    printers: ["yaml"],
  },
);
