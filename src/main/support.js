import arrayify from "../utils/arrayify.js";
import { options as coreOptions } from "./core-options.evaluate.js";

/**
 * @typedef {import("./core-options.evaluate.js").OptionInfo} OptionInfo
 * @typedef {{ name: string; pluginDefaults: Array<any> } & OptionInfo} NamedOptionInfo
 */

/**
 * Strings in `plugins` and `pluginSearchDirs` are handled by a wrapped version
 * of this function created by `withPlugins`. Don't pass them here directly.
 * @param {object} param0
 * @param {(string | object)[]=} param0.plugins Strings are resolved by `withPlugins`.
 * @param {string[]=} param0.pluginSearchDirs Added by `withPlugins`.
 * @param {boolean=} param0.showDeprecated
 * @param {boolean=} param0.showInternal
 * @return {{ languages: Array<any>, options: Array<NamedOptionInfo> }}
 */
function getSupportInfo({
  plugins = [],
  showDeprecated = false,
  showInternal = false,
} = {}) {
  const languages = plugins.flatMap((plugin) => plugin.languages || []);

  const options = arrayify(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
    "name"
  )
    .filter((option) => filterDeprecated(option))
    .sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
    .map(mapInternal)
    .map((option) => {
      option = { ...option };

      // This work this way because we used support `[{value: [], since: '0.0.0'}]`
      if (Array.isArray(option.default)) {
        option.default = option.default.at(-1).value;
      }

      if (Array.isArray(option.choices)) {
        option.choices = option.choices.filter((option) =>
          filterDeprecated(option)
        );

        if (option.name === "parser") {
          collectParsersFromLanguages(option, languages, plugins);
        }
      }

      const pluginDefaults = Object.fromEntries(
        plugins
          .filter(
            (plugin) => plugin.defaultOptions?.[option.name] !== undefined
          )
          .map((plugin) => [plugin.name, plugin.defaultOptions[option.name]])
      );

      return { ...option, pluginDefaults };
    });

  return { languages, options };

  function filterDeprecated(object) {
    return showDeprecated || !object.deprecated;
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
          const plugin = plugins.find((plugin) => plugin.parsers?.[value]);
          let description = language.name;
          if (plugin?.name) {
            description += ` (plugin: ${plugin.name})`;
          }
          option.choices.push({ value, description });
        }
      }
    }
  }
}

export { getSupportInfo };
