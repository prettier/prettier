import { Parser } from "../index.js";

declare const plugin: {
  parsers: {
    css: Parser;
    less: Parser;
    scss: Parser;
  };
};

export default plugin;
