import { Parser } from "./";

declare const parser: {
  parsers: {
    babel: Parser;
    "babel-flow": Parser;
    "babel-ts": Parser;
    json: Parser;
    json5: Parser;
    "json-stringify": Parser;
    __js_expression: Parser;
    __vue_expression: Parser;
    __vue_event_binding: Parser;
  };
};
export = parser;
