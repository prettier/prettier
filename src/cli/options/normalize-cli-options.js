import chalk from "chalk";
import leven from "leven";
import { normalizeCliOptions as prettierNormalizeCliOptions } from "../prettier-internal.js";

function normalizeCliOptions(options, optionInfos, opts) {
  return prettierNormalizeCliOptions(options, optionInfos, {
    colorsModule: chalk,
    levenshteinDistance: leven,
    ...opts,
  });
}

export default normalizeCliOptions;
