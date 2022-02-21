import commonOptions from "../common/common-options.js";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.js
const options = {
  bracketSpacing: commonOptions.bracketSpacing,
  singleQuote: commonOptions.singleQuote,
  proseWrap: commonOptions.proseWrap,
};

export default options;
