"use strict";

const semver = require("semver");
const currentVersion = require("../../package.json").version;
const loadPlugins = require("./load-plugins");

function getSupportInfo(version, options) {
  if (!version) {
    version = currentVersion;
  }

  const usePostCssParser = semver.lt(version, "1.7.1");

  const languages = loadPlugins(options)
    .reduce((all, plugin) => all.concat(plugin.languages), [])
    .filter(language => language.since && semver.gte(version, language.since))
    .map(language => {
      // Prevent breaking changes
      if (language.name === "Markdown") {
        return Object.assign({}, language, {
          parsers: ["markdown"]
        });
      }
      if (language.name === "TypeScript") {
        return Object.assign({}, language, {
          parsers: ["typescript"]
        });
      }

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
  getSupportInfo
};
