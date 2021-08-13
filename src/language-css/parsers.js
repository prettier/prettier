"use strict";

module.exports = {
  // TODO: switch these to just `postcss` and use `language` instead.
  get css() {
    return require("./parser-postcss.js").parsers.css;
  },
  get less() {
    return require("./parser-postcss.js").parsers.less;
  },
  get scss() {
    return require("./parser-postcss.js").parsers.scss;
  },
};
