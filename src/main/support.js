"use strict";

const semver = require("semver");
const arrayify = require("../utils/arrayify");
const currentVersion = require("../../package.json").version;
const coreOptions = require("./core-options").options;

function getSupportInfo(version, opts) {
  opts = {
    plugins: [],
    showUnreleased: false,
    showDeprecated: false,
    showInternal: false,
    ...opts
  };

  if (!version) {
    // pre-release version is smaller than the normal version in semver,
    // we need to treat it as the normal one so as to test new features.
    version = currentVersion.split("-", 1)[0];
  }

  const plugins = opts.plugins;

  const options = arrayify(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
    "name"
  )
    .filter(option => filterSince(option) && filterDeprecated(option))
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
    .map(mapDeprecated)
    .map(mapInternal)
    .map(option => {
      option = { ...option };

      if (Array.isArray(option.default)) {
        option.default =
          option.default.length === 1
            ? option.default[0].value
            : option.default
                .filter(filterSince)
                .sort((info1, info2) =>
                  semver.compare(info2.since, info1.since)
                )[0].value;
      }

      if (Array.isArray(option.choices)) {
        option.choices = option.choices
          .filter(option => filterSince(option) && filterDeprecated(option))
          .map(mapDeprecated);
      }

      const filteredPlugins = plugins.filter(
        plugin =>
          plugin.defaultOptions &&
          plugin.defaultOptions[option.name] !== undefined
      );
      const pluginDefaults = filteredPlugins.reduce((reduced, plugin) => {
        reduced[plugin.name] = plugin.defaultOptions[option.name];
        return reduced;
      }, {});
      return { ...option, pluginDefaults };
    });

  const usePostCssParser = semver.lt(version, "1.7.1");
  const useBabylonParser = semver.lt(version, "1.16.0");

  const languages = plugins
    .reduce((all, plugin) => all.concat(plugin.languages || []), [])
    .filter(filterSince)
    .map(language => {
      let parsers;
      // Prevent breaking changes
      if (language.name === "Markdown" || language.name === "TypeScript") {
        parsers = [language.name.toLowerCase()];
        // "babylon" was renamed to "babel" in 1.16.0
      } else if (useBabylonParser && language.parsers.includes("babel")) {
        parsers = language.parsers.map(parser =>
          parser === "babel" ? "babylon" : parser
        );
      } else if (
        usePostCssParser &&
        (language.name === "CSS" || language.group === "CSS")
      ) {
        parsers = ["postcss"];
      }
      return parsers ? { ...language, parsers } : language;
    });

  return { languages, options };

  function filterSince(object) {
    return (
      opts.showUnreleased ||
      !("since" in object) ||
      (object.since && semver.gte(version, object.since))
    );
  }
  function filterDeprecated(object) {
    return (
      opts.showDeprecated ||
      !("deprecated" in object) ||
      (object.deprecated && semver.lt(version, object.deprecated))
    );
  }
  function mapDeprecated(object) {
    if (!object.deprecated || opts.showDeprecated) {
      return object;
    }

    const { deprecated, redirect, ...newObject } = object;
    return newObject;
  }
  function mapInternal(object) {
    if (opts.showInternal) {
      return object;
    }
    const { cliName, cliCategory, cliDescription, ...newObject } = object;
    return newObject;
  }
}

module.exports = {
  getSupportInfo
};
