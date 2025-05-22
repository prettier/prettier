import cssLanguages from "../language-css/languages.evaluate.js";
import cssOptions from "../language-css/options.js";
import graphqlLanguages from "../language-graphql/languages.evaluate.js";
import graphqlOptions from "../language-graphql/options.js";
import handlebarsLanguages from "../language-handlebars/languages.evaluate.js";
import htmlLanguages from "../language-html/languages.evaluate.js";
import htmlOptions from "../language-html/options.js";
import jsLanguages from "../language-js/languages.evaluate.js";
import jsOptions from "../language-js/options.js";
import jsonLanguages from "../language-json/languages.evaluate.js";
import markdownLanguages from "../language-markdown/languages.evaluate.js";
import markdownOptions from "../language-markdown/options.js";
import yamlLanguages from "../language-yaml/languages.evaluate.js";
import yamlOptions from "../language-yaml/options.js";

function createParsersAndPrinters(modules) {
  const parsers = Object.create(null);
  const printers = Object.create(null);

  for (const {
    importPlugin,
    parsers: parserNames = [],
    printers: printerNames = [],
  } of modules) {
    const loadPlugin = async () => {
      const plugin = await importPlugin();
      Object.assign(parsers, plugin.parsers);
      Object.assign(printers, plugin.printers);
      return plugin;
    };

    for (const parserName of parserNames) {
      parsers[parserName] = async () =>
        (await loadPlugin()).parsers[parserName];
    }

    for (const printerName of printerNames) {
      printers[printerName] = async () =>
        (await loadPlugin()).printers[printerName];
    }
  }

  return { parsers, printers };
}

export const options = {
  ...cssOptions,
  ...graphqlOptions,
  ...htmlOptions,
  ...jsOptions,
  ...markdownOptions,
  ...yamlOptions,
};

export const languages = [
  ...cssLanguages,
  ...graphqlLanguages,
  ...handlebarsLanguages,
  ...htmlLanguages,
  ...jsLanguages,
  ...jsonLanguages,
  ...markdownLanguages,
  ...yamlLanguages,
];

// Lazy load the plugins
export const { parsers, printers } = createParsersAndPrinters([
  {
    importPlugin: () => import("./acorn.js"),
    parsers: ["acorn", "espree"],
  },
  {
    importPlugin: () => import("./angular.js"),
    parsers: [
      "__ng_action",
      "__ng_binding",
      "__ng_interpolation",
      "__ng_directive",
    ],
  },
  {
    importPlugin: () => import("./babel.js"),
    parsers: [
      "babel",
      "babel-flow",
      "babel-ts",
      "__js_expression",
      "__ts_expression",
      "__vue_expression",
      "__vue_ts_expression",
      "__vue_event_binding",
      "__vue_ts_event_binding",
      "__babel_estree",
      "json",
      "json5",
      "jsonc",
      "json-stringify",
    ],
  },
  {
    importPlugin: () => import("./estree.js"),
    printers: ["estree", "estree-json"],
  },
  {
    importPlugin: () => import("./flow.js"),
    parsers: ["flow"],
  },
  {
    importPlugin: () => import("./glimmer.js"),
    parsers: ["glimmer"],
    printers: ["glimmer"],
  },
  {
    importPlugin: () => import("./graphql.js"),
    parsers: ["graphql"],
    printers: ["graphql"],
  },
  {
    importPlugin: () => import("./html.js"),
    parsers: ["html", "angular", "vue", "lwc", "mjml"],
    printers: ["html"],
  },
  {
    importPlugin: () => import("./markdown.js"),
    parsers: ["markdown", "mdx", "remark"],
    printers: ["mdast"],
  },
  {
    importPlugin: () => import("./meriyah.js"),
    parsers: ["meriyah"],
  },
  {
    importPlugin: () => import("./postcss.js"),
    parsers: ["css", "less", "scss"],
    printers: ["postcss"],
  },
  {
    importPlugin: () => import("./typescript.js"),
    parsers: ["typescript"],
  },
  {
    importPlugin: () => import("./yaml.js"),
    parsers: ["yaml"],
    printers: ["yaml"],
  },
]);
