import chalk from "chalk";
import leven from "leven";
import prettierInternal from "../prettier-internal.js";

const { optionsNormalizer } = prettierInternal;

function normalizeCliOptions(options, optionInfos, opts) {
  return optionsNormalizer.normalizeCliOptions(options, optionInfos, {
    colorsModule: chalk,
    levenshteinDistance: leven,
    ...opts,
  });
}

export default normalizeCliOptions;
