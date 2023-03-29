import dashify from "dashify";
import { getSupportInfo } from "../../index.js";
import {
  coreOptions,
  getSupportInfoWithoutPlugins,
  normalizeOptionsConfig,
} from "../prettier-internal.js";
import cliOptions from "../cli-options.evaluate.js";

const detailedCliOptions = normalizeOptionsConfig(cliOptions).map((option) =>
  normalizeDetailedOption({
    category: coreOptions.CATEGORY_OTHER,
    ...option,
  })
);

function normalizeDetailedOption(option) {
  const cliOption = {
    ...option,
    name: option.cliName ?? dashify(option.name),
    description: option.cliDescription ?? option.description,
    category: option.cliCategory ?? coreOptions.CATEGORY_FORMAT,
    forwardToApi: option.name,
  };

  /* c8 ignore start */
  if (option.deprecated) {
    delete cliOption.forwardToApi;
    delete cliOption.description;
    delete cliOption.oppositeDescription;
  }
  /* c8 ignore stop */

  cliOption.choices = option.choices?.map((choice) => {
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
