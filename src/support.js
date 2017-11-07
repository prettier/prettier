"use strict";

const semver = require("semver");
const currentVersion = require("../package.json").version;

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const supportTable = [
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
    parsers: ["typescript"],
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
    name: "CSS",
    since: "1.4.0",
    parsers: ["css"],
    group: "CSS",
    tmScope: "source.css",
    aceMode: "css",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    extensions: [".css"],
    liguistLanguageId: 50,
    vscodeLanguageIds: ["css"]
  },
  {
    name: "Less",
    since: "1.4.0",
    parsers: ["less"],
    group: "CSS",
    extensions: [".less"],
    tmScope: "source.css.less",
    aceMode: "less",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    liguistLanguageId: 198,
    vscodeLanguageIds: ["less"]
  },
  {
    name: "SCSS",
    since: "1.4.0",
    parsers: ["scss"],
    group: "CSS",
    tmScope: "source.scss",
    aceMode: "scss",
    codemirrorMode: "css",
    codemirrorMimeType: "text/x-scss",
    extensions: [".scss"],
    liguistLanguageId: 329,
    vscodeLanguageIds: ["scss"]
  },
  {
    name: "GraphQL",
    since: "1.5.0",
    parsers: ["graphql"],
    extensions: [".graphql", ".gql"],
    tmScope: "source.graphql",
    aceMode: "text",
    liguistLanguageId: 139,
    vscodeLanguageIds: ["graphql"]
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
    vscodeLanguageIds: ["json"]
  },

  {
    name: "Markdown",
    since: "1.8.0",
    parsers: ["markdown"],
    aliases: ["pandoc"],
    aceMode: "markdown",
    codemirrorMode: "gfm",
    codemirrorMimeType: "text/x-gfm",
    wrap: true,
    extensions: [
      ".md",
      ".markdown",
      ".mdown",
      ".mdwn",
      ".mkd",
      ".mkdn",
      ".mkdown",
      ".ron",
      ".workbook"
    ],
    filenames: ["README"],
    tmScope: "source.gfm",
    linguistLanguageId: 222,
    vscodeLanguageIds: ["markdown"]
  },
  {
    name: "HTML",
    since: undefined, // unreleased
    parsers: ["parse5"],
    group: "HTML",
    tmScope: "text.html.basic",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    aliases: ["xhtml"],
    extensions: [".html", ".htm", ".html.hl", ".inc", ".st", ".xht", ".xhtml"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["html"]
  }
];

function getSupportInfo(version) {
  if (!version) {
    version = currentVersion;
  }

  const usePostCssParser = semver.lt(version, "1.7.1");

  const languages = supportTable
    .filter(language => language.since && semver.gte(version, language.since))
    .map(language => {
      if (usePostCssParser && language.group === "CSS") {
        return Object.assign({}, language, {
          parsers: ["postcss"]
        });
      }
      return language;
    });

  return { languages };
}

module.exports = {
  supportTable,
  getSupportInfo
};
