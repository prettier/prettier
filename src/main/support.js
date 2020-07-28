"use strict";

const semver = {
  compare: require("semver/functions/compare"),
  lt: require("semver/functions/lt"),
  gte: require("semver/functions/gte")
};
const arrayify = require("../utils/arrayify");
/* [prettierx merge] not needed at this point:
const currentVersion = require("../../package.json").version;
// */
const coreOptions = require("./core-options").options;

/**
 * Strings in `plugins` and `pluginSearchDirs` are handled by a wrapped version
 * of this function created by `withPlugins`. Don't pass them here directly.
 * @param {object} param0
 * @param {(string | object)[]=} param0.plugins Strings are resolved by `withPlugins`.
 * @param {string[]=} param0.pluginSearchDirs Added by `withPlugins`.
 * @param {boolean=} param0.showUnreleased
 * @param {boolean=} param0.showDeprecated
 * @param {boolean=} param0.showInternal
 */
function getSupportInfo({
  plugins = [],
  showUnreleased = false,
  showDeprecated = false,
  showInternal = false
} = {}) {
  // [prettierx merge] quick workaround:
  const version = "2.0.0";
  /* [prettierx merge] ignore for now:
  // pre-release version is smaller than the normal version in semver,
  // we need to treat it as the normal one so as to test new features.
  const version = currentVersion.split("-", 1)[0];
  // */

  const options = arrayify(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
    "name"
  )
    .filter(option => filterSince(option) && filterDeprecated(option))
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
    /** [prettierx merge] GONE:
    //* .filter(filterSince)
    .filter(filterDeprecated)
    .map(mapDeprecated)
    // */
    .map(mapInternal)
    .map(option => {
      option = { ...option };

      /** [prettierx merge] GONE:
      if (Array.isArray(newOption.default)) {
        newOption.default =
          newOption.default.length === 1
            ? newOption.default[0].value
            : newOption.default
                //* .filter(filterSince)
      // */
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

      /** [prettierx merge] GONE:
      if (Array.isArray(newOption.choices)) {
        newOption.choices = newOption.choices
          //* .filter(filterSince)
          .filter(filterDeprecated)
          .map(mapDeprecated);
      // */
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

      //* [prettierx merge] GONE:
      /** ** Old parsers not supported by prettierx:
  const usePostCssParser = semver.lt(version, "1.7.1");
  const useBabylonParser = semver.lt(version, "1.16.0");
  //* ** */

      /* [prettierx merge] GONE:
  const languages = plugins
    .reduce((all, plugin) => all.concat(plugin.languages || []), [])
    //* .filter(filterSince)
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

      /** ** Old parsers not supported by prettierx:
      // "babylon" was renamed to "babel" in 1.16.0
      if (useBabylonParser && language.parsers.indexOf("babel") !== -1) {
        return Object.assign({}, language, {
          parsers: language.parsers.map(parser =>
            parser === "babel" ? "babylon" : parser
          )
        });
      }

      if (
        usePostCssParser &&
        (language.name === "CSS" || language.group === "CSS")
      ) {
        return Object.assign({}, language, {
          parsers: ["postcss"]
        });
      }
      //* ** */

      /* [prettierx merge] GONE:
      return language;
    });

  return { languages, options };
  //* ** */

      //* [prettierx merge] GONE:
      //* function filterSince(object) {
      //*   return (
      //*     opts.showUnreleased ||
      //*     !("since" in object) ||
      //*     (object.since && semver.gte(version, object.since))
      //*   );
      //* }
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

  // [prettierx merge...]
  function filterDeprecated(object) {
    // filter deprecated as if this was prettier version 1.16.0:
    const version = "1.16.0";
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
