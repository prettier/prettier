"use strict";

module.exports = {
  // TODO: switch these to just `postcss` and use `language` instead.
  get css() {
    return require("./parser-postcss").parsers.css;
  },
  get less() {
    return require("./parser-postcss").parsers.less;
  },
  get scss() {
    return require("./parser-postcss").parsers.scss;
  },
};
