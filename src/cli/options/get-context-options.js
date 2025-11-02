import dashify from "dashify";
import { getSupportInfo } from "../../index.js";
import cliOptions from "../cli-options.evaluate.js";
import {
  getSupportInfoWithoutPlugins,
  normalizeOptionSettings,
  optionCategories,
} from "../prettier-internal.js";

const detailedCliOptions = normalizeOptionSettings(cliOptions).map((option) =>
  normalizeDetailedOption(option),
);

function apiOptionToCliOption(apiOption) {
  const cliOption = {
    ...apiOption,
    description: apiOption.cliDescription ?? apiOption.description,
    category: apiOption.cliCategory ?? optionCategories.CATEGORY_FORMAT,
    forwardToApi: apiOption.name,
  };

  /* c8 ignore start */
  if (apiOption.deprecated) {
    delete cliOption.forwardToApi;
    delete cliOption.description;
    delete cliOption.oppositeDescription;
    cliOption.deprecated = true;
  }
  /* c8 ignore stop */

  return normalizeDetailedOption(cliOption);
}

function normalizeDetailedOption(option) {
  return {
    category: optionCategories.CATEGORY_OTHER,
    ...option,
    name: option.cliName ?? dashify(option.name),
    choices: option.choices?.map((choice) => {
      const newChoice = {
        description: "",
        deprecated: false,
        ...(typeof choice === "object" ? choice : { value: choice }),
      };
      /* c8 ignore next 3 */
      if (newChoice.value === true) {
        newChoice.value = ""; // backward compatibility for original boolean option
      }
      return newChoice;
    }),
  };
}

function supportInfoToContextOptions({ options: supportOptions, languages }) {
  const detailedOptions = [
    ...detailedCliOptions,
    ...supportOptions.map((apiOption) => apiOptionToCliOption(apiOption)),
  ];

  return {
    supportOptions,
    languages,
    detailedOptions,
  };
}

async function getContextOptions(plugins) {
  const supportInfo = await getSupportInfo({
    showDeprecated: true,
    plugins,
  });

  return supportInfoToContextOptions(supportInfo);
}

function getContextOptionsWithoutPlugins() {
  const supportInfo = getSupportInfoWithoutPlugins();
  return supportInfoToContextOptions(supportInfo);
}

export { getContextOptions, getContextOptionsWithoutPlugins };
