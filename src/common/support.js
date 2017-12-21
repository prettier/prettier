"use strict";

const semver = require("semver");
const currentVersion = require("../../package.json").version;

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const supportTable = [
  {
    name: "CSS",
    since: "1.4.0",
    parsers: ["css"],
    group: "CSS",
    tmScope: "source.css",
    aceMode: "css",
    codemirrorMode: "css",
    codemirrorMimeType: "text/css",
    extensions: [".css", ".pcss", ".postcss"],
    liguistLanguageId: 50,
    vscodeLanguageIds: ["css", "postcss"]
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
    name: "Vue",
    since: "1.10.0",
    parsers: ["vue"],
    group: "HTML",
    tmScope: "text.html.vue",
    aceMode: "html",
    codemirrorMode: "htmlmixed",
    codemirrorMimeType: "text/html",
    extensions: [".vue"],
    linguistLanguageId: 146,
    vscodeLanguageIds: ["vue"]
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
