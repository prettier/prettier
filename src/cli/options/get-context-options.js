import dashify from "dashify";
import { getSupportInfo } from "../../index.js";
import { coreOptions } from "../prettier-internal.js";
import { options as cliOptionsMap } from "../constant.js";
import { arrayify } from "../utils.js";

const detailedCliOptions = arrayify(cliOptionsMap, "name").map((option) =>
  normalizeDetailedOption(option)
);

function apiOptionToCliOption(apiOption) {
  const cliOption = {
    ...apiOption,
    name: apiOption.cliName || dashify(apiOption.name),
    description: apiOption.cliDescription || apiOption.description,
    category: apiOption.cliCategory || coreOptions.CATEGORY_FORMAT,
    forwardToApi: apiOption.name,
  };

  /* istanbul ignore next */
  if (apiOption.deprecated) {
    delete cliOption.forwardToApi;
    delete cliOption.description;
    delete cliOption.oppositeDescription;
    cliOption.deprecated = true;
  }

  return normalizeDetailedOption(cliOption);
}

function normalizeDetailedOption(option) {
  return {
    category: coreOptions.CATEGORY_OTHER,
    ...option,
    choices: option.choices?.map((choice) => {
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
    ...detailedCliOptions,
    ...supportOptions.map((apiOption) => apiOptionToCliOption(apiOption)),
  ];

  return {
    supportOptions,
    languages,
    detailedOptions,
  };
}

export default getContextOptions;
