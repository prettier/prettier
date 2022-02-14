import markdownParser from "./parser-markdown.js";

const parsers = {
  /* istanbul ignore next */
  get remark() {
    return markdownParser.parsers.remark;
  },
  get markdown() {
    return markdownParser.parsers.remark;
  },
  get mdx() {
    return markdownParser.parsers.mdx;
  },
};

export default parsers;
