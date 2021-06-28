"use strict";

const createLanguage = require("../utils/create-language");
const estreePrinter = require("./printer-estree");
const estreeJsonPrinter = require("./printer-estree-json");
const options = require("./options");

const languages = [
  createLanguage(
    require("linguist-languages/data/JavaScript.json"),
    (data) => ({
      since: "0.0.0",
      parsers: [
        "babel",
        "espree",
        "meriyah",
        "babel-flow",
        "babel-ts",
        "flow",
        "typescript",
      ],
      vscodeLanguageIds: ["javascript", "mongo"],
      extensions: [
        ...data.extensions.filter((extension) => extension !== ".jsx"),
        // WeiXin Script (Weixin Mini Programs)
        // https://developers.weixin.qq.com/miniprogram/en/dev/framework/view/wxs/
        ".wxs",
      ],
    })
  ),
  createLanguage(require("linguist-languages/data/JavaScript.json"), () => ({
    name: "Flow",
    since: "0.0.0",
    parsers: ["flow", "babel-flow"],
    vscodeLanguageIds: ["javascript"],
    aliases: [],
    filenames: [],
    extensions: [".js.flow"],
  })),
  createLanguage(require("linguist-languages/data/JavaScript.json"), () => ({
    name: "JSX",
    since: "0.0.0",
    parsers: [
      "babel",
      "babel-flow",
      "babel-ts",
      "flow",
      "typescript",
      "espree",
      "meriyah",
    ],
    vscodeLanguageIds: ["javascriptreact"],
    aliases: undefined,
    filenames: undefined,
    extensions: [".jsx"],
    group: "JavaScript",
    interpreters: undefined,
    tmScope: "source.js.jsx",
    aceMode: "javascript",
    codemirrorMode: "jsx",
    codemirrorMimeType: "text/jsx",
    color: undefined,
  })),
  createLanguage(require("linguist-languages/data/TypeScript.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescript"],
  })),
  createLanguage(require("linguist-languages/data/TSX.json"), () => ({
    since: "1.4.0",
    parsers: ["typescript", "babel-ts"],
    vscodeLanguageIds: ["typescriptreact"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), () => ({
    name: "JSON.stringify",
    since: "1.13.0",
    parsers: ["json-stringify"],
    vscodeLanguageIds: ["json"],
    extensions: [], // .json file defaults to json instead of json-stringify
    filenames: ["package.json", "package-lock.json", "composer.json"],
  })),
  createLanguage(require("linguist-languages/data/JSON.json"), (data) => ({
    since: "1.5.0",
    parsers: ["json"],
    vscodeLanguageIds: ["json"],
    extensions: data.extensions.filter((extension) => extension !== ".jsonl"),
  })),
  createLanguage(
    require("linguist-languages/data/JSON with Comments.json"),
    (data) => ({
      since: "1.5.0",
      parsers: ["json"],
      vscodeLanguageIds: ["jsonc"],
      filenames: [...data.filenames, ".eslintrc"],
    })
  ),
  createLanguage(require("linguist-languages/data/JSON5.json"), () => ({
    since: "1.13.0",
    parsers: ["json5"],
    vscodeLanguageIds: ["json5"],
  })),
];

const printers = {
  estree: estreePrinter,
  "estree-json": estreeJsonPrinter,
};

const parsers = {
  // JS - Babel
  get babel() {
    return require("./parser-babel").parsers.babel;
  },
  get "babel-flow"() {
    return require("./parser-babel").parsers["babel-flow"];
  },
  get "babel-ts"() {
    return require("./parser-babel").parsers["babel-ts"];
  },
  get json() {
    return require("./parser-babel").parsers.json;
  },
  get json5() {
    return require("./parser-babel").parsers.json5;
  },
  get "json-stringify"() {
    return require("./parser-babel").parsers["json-stringify"];
  },
  get __js_expression() {
    return require("./parser-babel").parsers.__js_expression;
  },
  get __vue_expression() {
    return require("./parser-babel").parsers.__vue_expression;
  },
  get __vue_event_binding() {
    return require("./parser-babel").parsers.__vue_event_binding;
  },
  // JS - Flow
  get flow() {
    return require("./parser-flow").parsers.flow;
  },
  // JS - TypeScript
  get typescript() {
    return require("./parser-typescript").parsers.typescript;
  },
  // JS - Angular Action
  get __ng_action() {
    return require("./parser-angular").parsers.__ng_action;
  },
  // JS - Angular Binding
  get __ng_binding() {
    return require("./parser-angular").parsers.__ng_binding;
  },
  // JS - Angular Interpolation
  get __ng_interpolation() {
    return require("./parser-angular").parsers.__ng_interpolation;
  },
  // JS - Angular Directive
  get __ng_directive() {
    return require("./parser-angular").parsers.__ng_directive;
  },
  // JS - espree
  get espree() {
    return require("./parser-espree").parsers.espree;
  },
  // JS - meriyah
  get meriyah() {
    return require("./parser-meriyah").parsers.meriyah;
  },
  // JS - Babel Estree
  get __babel_estree() {
    return require("./parser-babel").parsers.__babel_estree;
  },
};

module.exports = {
  languages,
  options,
  printers,
  parsers,
};
