import { Parser } from "../../index.js";

declare const plugin: {
  parsers: {
    __ng_action: Parser;
    __ng_binding: Parser;
    __ng_interpolation: Parser;
    __ng_directive: Parser;
  };
};

export default plugin;
