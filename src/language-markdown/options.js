import commonOptions from "../common/common-options.evaluate.js";

// format based on https://github.com/prettier/prettier/blob/main/src/main/core-options.evaluate.js
const options = {
  proseWrap: commonOptions.proseWrap,
  singleQuote: commonOptions.singleQuote,
};

export default options;
