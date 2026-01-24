import coreOptions from "./core-options.evaluate.js";

/**
 * @import {OptionInfo} from "./core-options.evaluate.js"
 * @typedef {{ name: string; pluginDefaults: Array<any> } & OptionInfo} NamedOptionInfo
 */

/**
 * Strings in `plugins` are handled by a wrapped version
 * of this function created by `withPlugins`. Don't pass them here directly.
 * @param {object} param0
 * @param {(string | object)[]=} param0.plugins Strings are resolved by `withPlugins`.
 * @param {boolean=} param0.showDeprecated
 * @return {{ languages: Array<any>, options: Array<NamedOptionInfo> }}
 */
function getSupportInfo({ plugins = [], showDeprecated = false } = {}) {
  const languages = plugins.flatMap((plugin) => plugin.languages ?? []);

  const options = [];
  for (const option of normalizeOptionSettings(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
  )) {
    if (!showDeprecated && option.deprecated) {
      continue;
    }

    if (Array.isArray(option.choices)) {
      if (!showDeprecated) {
        option.choices = option.choices.filter((choice) => !choice.deprecated);
      }

      if (option.name === "parser") {
        option.choices = [
          ...option.choices,
          ...collectParsersFromLanguages(option.choices, languages, plugins),
        ];
      }
    }

    option.pluginDefaults = Object.fromEntries(
      plugins
        .filter((plugin) => plugin.defaultOptions?.[option.name] !== undefined)
        .map((plugin) => [plugin.name, plugin.defaultOptions[option.name]]),
    );

    options.push(option);
  }

  return { languages, options };
}

function* collectParsersFromLanguages(parserChoices, languages, plugins) {
  const existingParsers = new Set(parserChoices.map((choice) => choice.value));

  for (const language of languages) {
    if (language.parsers) {
      for (const parserName of language.parsers) {
        if (!existingParsers.has(parserName)) {
          existingParsers.add(parserName);
          const plugin = plugins.find(
            (plugin) =>
              plugin.parsers && Object.hasOwn(plugin.parsers, parserName),
          );

          let description = language.name;
          if (plugin?.name) {
            description += ` (plugin: ${plugin.name})`;
          }
          yield { value: parserName, description };
        }
      }
    }
  }
}

function normalizeOptionSettings(settings) {
  const options = [];
  for (const [name, originalOption] of Object.entries(settings)) {
    const option = { name, ...originalOption };

    // This work this way because we used support `[{value: [], since: '0.0.0'}]`
    if (Array.isArray(option.default)) {
      option.default = option.default.at(-1).value;
    }

    options.push(option);
  }

  return options;
}

export { getSupportInfo, normalizeOptionSettings };
