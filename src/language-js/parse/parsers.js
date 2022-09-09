import getParserFromModule from "../../utils/get-parser-from-plugin-module.js";

const parsers = {
  // Babel
  babel: () => getParserFromModule(import("./babel.js"), "babel"),
  "babel-flow": () => getParserFromModule(import("./babel.js"), "babel-flow"),
  "babel-ts": () => getParserFromModule(import("./babel.js"), "babel-ts"),
  json: () => getParserFromModule(import("./babel.js"), "json"),
  json5: () => getParserFromModule(import("./babel.js"), "json5"),
  "json-stringify": () =>
    getParserFromModule(import("./babel.js"), "json-stringify"),
  __js_expression: () =>
    getParserFromModule(import("./babel.js"), "__js_expression"),
  __vue_expression: () =>
    getParserFromModule(import("./babel.js"), "__vue_expression"),
  __vue_ts_expression: () =>
    getParserFromModule(import("./babel.js"), "__vue_ts_expression"),
  __vue_event_binding: () =>
    getParserFromModule(import("./babel.js"), "__vue_event_binding"),
  __vue_ts_event_binding: () =>
    getParserFromModule(import("./babel.js"), "__vue_ts_event_binding"),
  __babel_estree: () =>
    getParserFromModule(import("./babel.js"), "__babel_estree"),
  // Flow
  flow: () => getParserFromModule(import("./flow.js"), "flow"),
  // TypeScript
  typescript: () =>
    getParserFromModule(import("./typescript.js"), "typescript"),
  // Angular
  __ng_action: () => getParserFromModule(import("./angular.js"), "__ng_action"),
  __ng_binding: () =>
    getParserFromModule(import("./angular.js"), "__ng_binding"),
  __ng_interpolation: () =>
    getParserFromModule(import("./angular.js"), "__ng_interpolation"),
  __ng_directive: () =>
    getParserFromModule(import("./angular.js"), "__ng_directive"),
  // Acorn and Espree
  acorn: () => getParserFromModule(import("./acorn-and-espree.js"), "acorn"),
  espree: () => getParserFromModule(import("./acorn-and-espree.js"), "espree"),
  // Meriyah
  meriyah: () => getParserFromModule(import("./meriyah.js"), "meriyah"),
};

export default parsers;
