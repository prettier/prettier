/* BUNDLE_REMOVE_START */
import parserPostCss from "./parser-postcss.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  // TODO: switch these to just `postcss` and use `language` instead.
  get css() {
    return /* require("./parser-postcss.js") */ parserPostCss.parsers.css;
  },
  get less() {
    return /* require("./parser-postcss.js") */ parserPostCss.parsers.less;
  },
  get scss() {
    return /* require("./parser-postcss.js") */ parserPostCss.parsers.scss;
  },
};

export default parsers;
