"use strict";

const semver = require("semver");
const currentVersion = require("../../package.json").version;

// Based on:
// https://github.com/github/linguist/blob/master/lib/linguist/languages.yml

const supportTable = [];

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
