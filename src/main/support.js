"use strict";

const semver = {
  compare: require("semver/functions/compare"),
  lt: require("semver/functions/lt"),
  gte: require("semver/functions/gte")
};
const arrayify = require("../utils/arrayify");
const currentVersion = require("../../package.json").version;
const coreOptions = require("./core-options").options;

function getSupportInfo({
  plugins = [],
  showUnreleased = false,
  showDeprecated = false,
  showInternal = false
} = {}) {
  // pre-release version is smaller than the normal version in semver,
  // we need to treat it as the normal one so as to test new features.
  const version = currentVersion.split("-", 1)[0];

  const options = arrayify(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
    "name"
  )
    .filter(option => filterSince(option) && filterDeprecated(option))
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
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
        option.choices = option.choices.filter(
          option => filterSince(option) && filterDeprecated(option)
        );
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

  const languages = plugins
    .reduce((all, plugin) => all.concat(plugin.languages || []), [])
    .filter(filterSince);

  return { languages, options };

  function filterSince(object) {
    return (
      showUnreleased ||
      !("since" in object) ||
      (object.since && semver.gte(version, object.since))
    );
  }

  function filterDeprecated(object) {
    return (
      showDeprecated ||
      !("deprecated" in object) ||
      (object.deprecated && semver.lt(version, object.deprecated))
    );
  }

  function mapInternal(object) {
    if (showInternal) {
      return object;
    }
    const { cliName, cliCategory, cliDescription, ...newObject } = object;
    return newObject;
  }
}

module.exports = {
  getSupportInfo
};
