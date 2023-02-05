import { Parser } from "../";

declare const parser: {
  parsers: {
    acorn: Parser;
    espree: Parser;
  };
};

export = parser;
