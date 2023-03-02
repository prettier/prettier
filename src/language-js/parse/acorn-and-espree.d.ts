import { Parser } from "../../index.js";

declare const plugin: {
  parsers: {
    acorn: Parser;
    espree: Parser;
  };
};

export default plugin;
