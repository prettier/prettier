import { Parser } from "../index.js";

declare const plugin: {
  parsers: {
    remark: Parser;
    markdown: Parser;
    mdx: Parser;
  };
};

export default plugin;
