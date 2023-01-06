import { Parser } from "./";

declare const parser: {
  parsers: {
    css: Parser;
    less: Parser;
    scss: Parser;
  };
};
export = parser;
