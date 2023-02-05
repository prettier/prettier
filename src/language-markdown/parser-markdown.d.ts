import { Parser } from "../index.js";

declare const parser: {
  parsers: {
    remark: Parser;
    markdown: Parser;
    mdx: Parser;
  };
};
export = parser;
