import { Parser } from "../index.js";

declare const parser: {
  parsers: {
    css: Parser;
    less: Parser;
    scss: Parser;
  };
};
export = parser;
