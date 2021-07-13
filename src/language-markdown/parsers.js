"use strict";

module.exports = {
  /* istanbul ignore next */
  get remark() {
    return require("./parser-markdown").parsers.remark;
  },
  get markdown() {
    return require("./parser-markdown").parsers.remark;
  },
  get mdx() {
    return require("./parser-markdown").parsers.mdx;
  },
};
