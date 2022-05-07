import dashify from "dashify";
import { getSupportInfo } from "../../index.js";
import { optionsHiddenDefaults, coreOptions } from "../prettier-internal.js";
import { options as cliOptions } from "../constant.js";
import { arrayify } from "../utils.js";

function apiOptionToCliOption(apiOption) {
  const cliOption = {
    ...apiOption,
    name: apiOption.cliName || dashify(apiOption.name),
    description: apiOption.cliDescription || apiOption.description,
    category: apiOption.cliCategory || apiOption.CATEGORY_FORMAT,
    forwardToApi: apiOption.name,
  };

  /* istanbul ignore next */
  if (apiOption.deprecated) {
    delete cliOption.forwardToApi;
    delete cliOption.description;
    delete cliOption.oppositeDescription;
    cliOption.deprecated = true;
  }

  return cliOption;
}

function normalizeDetailedOption(name, option) {
  return {
    category: coreOptions.CATEGORY_OTHER,
    ...option,
    choices:
      option.choices &&
      option.choices.map((choice) => {
        const newChoice = {
          description: "",
          deprecated: false,
          ...(typeof choice === "object" ? choice : { value: choice }),
        };
        /* istanbul ignore next */
        if (newChoice.value === true) {
          newChoice.value = ""; // backward compatibility for original boolean option
        }
        return newChoice;
      }),
  };
}

async function getContextOptions(plugins, pluginSearchDirs) {
  const { options: supportOptions, languages } = await getSupportInfo({
    showDeprecated: true,
    showUnreleased: true,
    showInternal: true,
    plugins,
    pluginSearchDirs,
  });

  const detailedOptions = [
    ...supportOptions.map((apiOption) => apiOptionToCliOption(apiOption)),
    ...arrayify(cliOptions),
  ]
    .map((options) => normalizeDetailedOption(options))
    .sort((optionA, optionB) => optionA.name.localeCompare(optionB.name));

  const apiDefaultOptions = {
    ...optionsHiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter(({ deprecated }) => !deprecated)
        .map((option) => [option.name, option.default])
    ),
  };

  const detailedOptionMap = Object.create(detailedOptions.map(option => [option.name, option]));

  return {
    supportOptions,
    detailedOptions,
    detailedOptionMap,
    apiDefaultOptions,
    languages,
  };
}

export default getContextOptions;
