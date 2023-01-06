import { Parser } from "./";

declare const parser: {
  parsers: {
    remark: Parser;
    markdown: Parser;
    mdx: Parser;
  };
};
export = parser;
