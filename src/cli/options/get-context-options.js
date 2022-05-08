import { getSupportInfo } from "../../index.js";
import {
  optionsHiddenDefaults,
  getSupportInfoWithoutPlugins,
} from "../prettier-internal.js";
import * as constant from "../constant.js";
import { arrayify } from "../utils.js";
import {
  normalizeDetailedOptionMap,
  createDetailedOptionMap,
} from "./option-map.js";

function supportInfoToContextOptions({ options: supportOptions, languages }) {
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

async function getContextOptions(plugins, pluginSearchDirs) {
  const supportInfo = await getSupportInfo({
    showDeprecated: true,
    showUnreleased: true,
    showInternal: true,
    plugins,
    pluginSearchDirs,
  });

  return supportInfoToContextOptions(supportInfo);
}

function getContextOptionsWithoutPlugins() {
  const supportInfo = getSupportInfoWithoutPlugins({ showInternal: true });
  return supportInfoToContextOptions(supportInfo);
}

export { getContextOptions, getContextOptionsWithoutPlugins };
