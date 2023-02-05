import { Parser } from "../../index.js";

declare const parser: {
  parsers: {
    acorn: Parser;
    espree: Parser;
  };
};

export = parser;
