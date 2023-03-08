import { Parser } from "../index.js";

declare const plugin: {
  parsers: {
    html: Parser;
    angular: Parser;
    vue: Parser;
    lwc: Parser;
  };
};

export default plugin;
