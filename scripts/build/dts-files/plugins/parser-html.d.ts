import { Parser } from "./";

declare const parser: {
  parsers: {
    html: Parser;
    angular: Parser;
    vue: Parser;
    lwc: Parser;
  };
};
export = parser;
