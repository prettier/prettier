"use strict";

const printer = require("./printer-estree");
const options = require("./options");
const privateUtil = require("../common/util");

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const locStart = function(node) {
  // Handle nodes with decorators. They should start at the first decorator
  if (
    node.declaration &&
    node.declaration.decorators &&
    node.declaration.decorators.length > 0
  ) {
    return locStart(node.declaration.decorators[0]);
  }
  if (node.decorators && node.decorators.length > 0) {
    return locStart(node.decorators[0]);
  }

  if (node.__location) {
    return node.__location.startOffset;
  }
  if (node.range) {
    return node.range[0];
  }
  if (typeof node.start === "number") {
    return node.start;
  }
  if (node.loc) {
    return node.loc.start;
  }
  return null;
};

const locEnd = function(node) {
  const endNode = node.nodes && privateUtil.getLast(node.nodes);
  if (endNode && node.source && !node.source.end) {
    node = endNode;
  }

  let loc;
  if (node.range) {
    loc = node.range[1];
  } else if (typeof node.end === "number") {
    loc = node.end;
  }

  if (node.__location) {
    return node.__location.endOffset;
  }
  if (node.typeAnnotation) {
    return Math.max(loc, locEnd(node.typeAnnotation));
  }

  if (node.loc && !loc) {
    return node.loc.end;
  }

  return loc;
};

const languages = [
  {
    name: "JavaScript",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    tmScope: "source.js",
    aceMode: "javascript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "text/javascript",
    aliases: ["js", "node"],
    extensions: [
      ".js",
      "._js",
      ".bones",
      ".es",
      ".es6",
      ".frag",
      ".gs",
      ".jake",
      ".jsb",
      ".jscad",
      ".jsfl",
      ".jsm",
      ".jss",
      ".mjs",
      ".njs",
      ".pac",
      ".sjs",
      ".ssjs",
      ".xsjs",
      ".xsjslib"
    ],
    filenames: ["Jakefile"],
    linguistLanguageId: 183,
    vscodeLanguageIds: ["javascript"]
  },
  {
    name: "JSX",
    since: "0.0.0",
    parsers: ["babylon", "flow"],
    group: "JavaScript",
    extensions: [".jsx"],
    tmScope: "source.js.jsx",
    aceMode: "javascript",
    codemirrorMode: "jsx",
    codemirrorMimeType: "text/jsx",
    liguistLanguageId: 178,
    vscodeLanguageIds: ["javascriptreact"]
  },
  {
    name: "TypeScript",
    since: "1.4.0",
    parsers: ["typescript-eslint"],
    group: "JavaScript",
    aliases: ["ts"],
    extensions: [".ts", ".tsx"],
    tmScope: "source.ts",
    aceMode: "typescript",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/typescript",
    liguistLanguageId: 378,
    vscodeLanguageIds: ["typescript", "typescriptreact"]
  },
  {
    name: "JSON",
    since: "1.5.0",
    parsers: ["json"],
    group: "JavaScript",
    tmScope: "source.json",
    aceMode: "json",
    codemirrorMode: "javascript",
    codemirrorMimeType: "application/json",
    extensions: [
      ".json",
      ".json5",
      ".geojson",
      ".JSON-tmLanguage",
      ".topojson"
    ],
    filenames: [
      ".arcconfig",
      ".jshintrc",
      ".babelrc",
      ".eslintrc",
      ".prettierrc",
      "composer.lock",
      "mcmod.info"
    ],
    linguistLanguageId: 174,
    vscodeLanguageIds: ["json", "jsonc"]
  }
];

const typescript = {
  get parse() {
    return eval("require")("./parser-typescript");
  },
  astFormat: "estree",
  locStart,
  locEnd
};

const babylon = {
  get parse() {
    return eval("require")("./parser-babylon");
  },
  astFormat: "estree",
  locStart,
  locEnd
};

const parsers = {
  babylon,
  json: babylon,
  flow: {
    get parse() {
      return eval("require")("./parser-flow");
    },
    astFormat: "estree",
    locStart,
    locEnd
  },
  "typescript-eslint": typescript,
  // TODO: Delete this in 2.0
  typescript
};

const printers = {
  estree: printer
};

module.exports = {
  languages,
  options,
  parsers,
  printers,
  locStart,
  locEnd
};
