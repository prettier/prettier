import { createRequire } from "node:module";
import semverCompare from "semver/functions/compare.js";
import semverGte from "semver/functions/gte.js";
import semverLt from "semver/functions/lt.js";
import arrayify from "../utils/arrayify.js";
import { options as coreOptions } from "./core-options.js";

const require = createRequire(import.meta.url);

const currentVersion = require("../../package.json").version;

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
  showInternal = false,
} = {}) {
  // pre-release version is smaller than the normal version in semver,
  // we need to treat it as the normal one so as to test new features.
  const version = currentVersion.split("-", 1)[0];

  const languages = plugins
    .flatMap((plugin) => plugin.languages || [])
    .filter(filterSince);

  const options = arrayify(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
    "name"
  )
    .filter((option) => filterSince(option) && filterDeprecated(option))
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
    .map(mapInternal)
    .map((option) => {
      option = { ...option };

      if (Array.isArray(option.default)) {
        option.default =
          option.default.length === 1
            ? option.default[0].value
            : option.default
                .filter(filterSince)
                .sort((info1, info2) =>
                  semverCompare(info2.since, info1.since)
                )[0].value;
      }

      if (Array.isArray(option.choices)) {
        option.choices = option.choices.filter(
          (option) => filterSince(option) && filterDeprecated(option)
        );

        if (option.name === "parser") {
          collectParsersFromLanguages(option, languages, plugins);
        }
      }

      const pluginDefaults = Object.fromEntries(
        plugins
          .filter(
            (plugin) =>
              plugin.defaultOptions &&
              plugin.defaultOptions[option.name] !== undefined
          )
          .map((plugin) => [plugin.name, plugin.defaultOptions[option.name]])
      );

      return { ...option, pluginDefaults };
    });

  return { languages, options };

  function filterSince(object) {
    return (
      showUnreleased ||
      !("since" in object) ||
      (object.since && semverGte(version, object.since))
    );
  }

  function filterDeprecated(object) {
    return (
      showDeprecated ||
      !("deprecated" in object) ||
      (object.deprecated && semverLt(version, object.deprecated))
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

function collectParsersFromLanguages(option, languages, plugins) {
  const existingValues = new Set(option.choices.map((choice) => choice.value));
  for (const language of languages) {
    if (language.parsers) {
      for (const value of language.parsers) {
        if (!existingValues.has(value)) {
          existingValues.add(value);
          const plugin = plugins.find(
            (plugin) => plugin.parsers && plugin.parsers[value]
          );
          let description = language.name;
          if (plugin && plugin.name) {
            description += ` (plugin: ${plugin.name})`;
          }
          option.choices.push({ value, description });
        }
      }
    }
  }
}

export { getSupportInfo };
