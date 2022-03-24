/* BUNDLE_REMOVE_START */
import markdownParser from "./parser-markdown.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  /* istanbul ignore next */
  get remark() {
    return /* require("./parser-markdown.js") */ markdownParser.parsers.remark;
  },
  get markdown() {
    return /* require("./parser-markdown.js") */ markdownParser.parsers.remark;
  },
  get mdx() {
    return /* require("./parser-markdown.js") */ markdownParser.parsers.mdx;
  },
};

export default parsers;
