import parserPostCss from "./parser-postcss.js";

const parsers = {
  // TODO: switch these to just `postcss` and use `language` instead.
  get css() {
    return parserPostCss.parsers.css;
  },
  get less() {
    return parserPostCss.parsers.less;
  },
  get scss() {
    return parserPostCss.parsers.scss;
  },
};

export default parsers;
