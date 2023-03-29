import dashify from "dashify";
import { getSupportInfo } from "../../index.js";
import {
  optionCategories,
  getSupportInfoWithoutPlugins,
  normalizeOptionsConfig,
} from "../prettier-internal.js";
import cliOptions from "../cli-options.evaluate.js";

const detailedCliOptions = normalizeOptionsConfig(cliOptions).map((option) =>
  normalizeDetailedOption({
    cliCategory: option.category ?? optionCategories.CATEGORY_OTHER,
    ...option,
  })
);

function normalizeDetailedOption(option) {
  const cliOption = {
    ...option,
    name: option.cliName ?? dashify(option.name),
    description: option.cliDescription ?? option.description,
    category: option.cliCategory ?? optionCategories.CATEGORY_FORMAT,
    forwardToApi: option.name,
  };

  /* c8 ignore start */
  if (option.deprecated) {
    delete cliOption.forwardToApi;
    delete cliOption.description;
    delete cliOption.oppositeDescription;
  }
  /* c8 ignore stop */

  if (Array.isArray(option.choices)) {
    cliOption.choices = option.choices.map((choice) => {
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
    });
  }

  return cliOption;
}

function supportInfoToContextOptions({ options: supportOptions, languages }) {
  const detailedOptions = [
    ...detailedCliOptions,
    ...supportOptions.map((apiOption) => normalizeDetailedOption(apiOption)),
  ];

  return {
    supportOptions,
    languages,
    detailedOptions,
  };
}

async function getContextOptions(plugins, pluginSearchDirs) {
  const supportInfo = await getSupportInfo({
    showDeprecated: true,
    plugins,
    pluginSearchDirs,
  });

  return supportInfoToContextOptions(supportInfo);
}

function getContextOptionsWithoutPlugins() {
  const supportInfo = getSupportInfoWithoutPlugins();
  return supportInfoToContextOptions(supportInfo);
}

export { getContextOptions, getContextOptionsWithoutPlugins };
