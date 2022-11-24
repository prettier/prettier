"use strict";

// TODO: only check `less` when we don't use `less` to parse `css`
function isLessParser(options) {
  return options.parser === "css" || options.parser === "less";
}

module.exports = isLessParser;
