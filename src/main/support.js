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
 * @return {{ languages: Array<any>, options: Array<NamedOptionInfo> }}
 */
function getSupportInfo({ plugins = [], showDeprecated = false } = {}) {
  const languages = plugins.flatMap((plugin) => plugin.languages ?? []);

  const options = [];
  for (const option of normalizeOptionsConfig(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions)
  )) {
    if (!showDeprecated && option.deprecated) {
      continue;
    }

    if (Array.isArray(option.choices)) {
      let { choices } = option;
      choices = showDeprecated
        ? [...choices]
        : choices.filter((choice) => !choice.deprecated);

      if (option.name === "parser") {
        choices.push(
          ...collectParsersFromLanguages(choices, languages, plugins)
        );
      }
    }

    option.pluginDefaults = Object.fromEntries(
      plugins
        .filter((plugin) => plugin.defaultOptions?.[option.name] !== undefined)
        .map((plugin) => [plugin.name, plugin.defaultOptions[option.name]])
    );

    options.push(option);
  }

  return { languages, options };
}

function* collectParsersFromLanguages(parserChoices, languages, plugins) {
  const existingParsers = new Set(parserChoices.map((choice) => choice.value));

  for (const language of languages) {
    if (language.parsers) {
      for (const value of language.parsers) {
        if (!existingParsers.has(value)) {
          existingParsers.add(value);
          const plugin = plugins.find((plugin) => plugin.parsers?.[value]);
          let description = language.name;
          if (plugin?.name) {
            description += ` (plugin: ${plugin.name})`;
          }
          yield { value, description };
        }
      }
    }
  }
}

function normalizeOptionsConfig(config) {
  const options = [];
  for (const [name, originalOption] of Object.entries(config)) {
    const option = { name, ...originalOption };

    // This work this way because we used support `[{value: [], since: '0.0.0'}]`
    if (Array.isArray(option.default)) {
      option.default = option.default.at(-1).value;
    }

    options.push(option);
  }

  return options;
}

export { getSupportInfo, normalizeOptionsConfig };
