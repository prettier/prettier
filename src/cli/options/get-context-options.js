import { getSupportInfo } from "../../index.js";
import { optionsHiddenDefaults } from "../prettier-internal.js";
import * as constant from "../constant.js";
import { arrayify } from "../utils.js";
import {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
} from "./option-map.js";

function getContextOptions(plugins, pluginSearchDirs) {
  const { options: supportOptions, languages } = getSupportInfo({
    showDeprecated: true,
    showUnreleased: true,
    showInternal: true,
    plugins,
    pluginSearchDirs,
  });
  const detailedOptionMap = normalizeDetailedOptionMap({
    ...createDetailedOptionMap(supportOptions),
    ...constant.options,
  });

  const detailedOptions = arrayify(detailedOptionMap, "name");

  const apiDefaultOptions = {
    ...optionsHiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter(({ deprecated }) => !deprecated)
        .map((option) => [option.name, option.default])
    ),
  };

  return {
    supportOptions,
    detailedOptions,
    detailedOptionMap,
    apiDefaultOptions,
    languages,
  };
}

export default getContextOptions;
