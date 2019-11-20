"use strict";

const semver = require("semver");
const arrayify = require("../utils/arrayify");
const currentVersion = require("../../package.json").version;
const coreOptions = require("./core-options").options;

function getSupportInfo(version, opts) {
  opts = Object.assign(
    {
      plugins: [],
      showUnreleased: false,
      showDeprecated: false,
      showInternal: false
    },
    opts
  );

  if (!version) {
    // pre-release version is smaller than the normal version in semver,
    // we need to treat it as the normal one so as to test new features.
    version = currentVersion.split("-", 1)[0];
  }

  const plugins = opts.plugins;

  const options = arrayify(
    Object.assign(
      plugins.reduce(
        (currentOptions, plugin) =>
          Object.assign(currentOptions, plugin.options),
        {}
      ),
      coreOptions
    ),
    "name"
  )
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
    //* .filter(filterSince)
    .filter(filterDeprecated)
    .map(mapDeprecated)
    .map(mapInternal)
    .map(option => {
      const newOption = Object.assign({}, option);

      if (Array.isArray(newOption.default)) {
        newOption.default =
          newOption.default.length === 1
            ? newOption.default[0].value
            : newOption.default
                //* .filter(filterSince)
                .sort((info1, info2) =>
                  semver.compare(info2.since, info1.since)
                )[0].value;
      }

      if (Array.isArray(newOption.choices)) {
        newOption.choices = newOption.choices
          //* .filter(filterSince)
          .filter(filterDeprecated)
          .map(mapDeprecated);
      }

      return newOption;
    })
    .map(option => {
      const filteredPlugins = plugins.filter(
        plugin =>
          plugin.defaultOptions &&
          plugin.defaultOptions[option.name] !== undefined
      );
      const pluginDefaults = filteredPlugins.reduce((reduced, plugin) => {
        reduced[plugin.name] = plugin.defaultOptions[option.name];
        return reduced;
      }, {});
      return Object.assign(option, { pluginDefaults });
    });

  /** ** Old parsers not supported by prettierx:
  const usePostCssParser = semver.lt(version, "1.7.1");
  const useBabylonParser = semver.lt(version, "1.16.0");
  //* ** */

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

      return language;
    });

  return { languages, options };

  //* function filterSince(object) {
  //*   return (
  //*     opts.showUnreleased ||
  //*     !("since" in object) ||
  //*     (object.since && semver.gte(version, object.since))
  //*   );
  //* }
  function filterDeprecated(object) {
    // filter deprecated as if this was prettier version 1.16.0:
    const version = "1.16.0";
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
    const newObject = Object.assign({}, object);
    delete newObject.deprecated;
    delete newObject.redirect;
    return newObject;
  }
  function mapInternal(object) {
    if (opts.showInternal) {
      return object;
    }
    const newObject = Object.assign({}, object);
    delete newObject.cliName;
    delete newObject.cliCategory;
    delete newObject.cliDescription;
    return newObject;
  }
}

module.exports = {
  getSupportInfo
};
