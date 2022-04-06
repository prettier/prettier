import chalk from "chalk";
import leven from "leven";
import { optionsNormalizer } from "../prettier-internal.js";

function normalizeCliOptions(options, optionInfos, opts) {
  return optionsNormalizer.normalizeCliOptions(options, optionInfos, {
    colorsModule: chalk,
    levenshteinDistance: leven,
    ...opts,
  });
}

export default normalizeCliOptions;
