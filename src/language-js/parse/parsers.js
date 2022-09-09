const parsers = {
  // Babel
  babel: async () => (await import("./babel.js")).parsers.babel,
  "babel-flow": async () => (await import("./babel.js")).parsers["babel-flow"],
  "babel-ts": async () => (await import("./babel.js")).parsers["babel-ts"],
  json: async () => (await import("./babel.js")).parsers.json,
  json5: async () => (await import("./babel.js")).parsers.json5,
  "json-stringify": async () =>
    (await import("./babel.js")).parsers["json-stringify"],
  __js_expression: async () =>
    (await import("./babel.js")).parsers.__js_expression,
  __vue_expression: async () =>
    (await import("./babel.js")).parsers.__vue_expression,
  __vue_ts_expression: async () =>
    (await import("./babel.js")).parsers.__vue_ts_expression,
  __vue_ts_event_binding: async () =>
    (await import("./babel.js")).parsers.__vue_ts_event_binding,
  __vue_event_binding: async () =>
    (await import("./babel.js")).parsers.__vue_event_binding,
  __babel_estree: async () =>
    (await import("./babel.js")).parsers.__babel_estree,
  // Flow
  flow: async () => (await import("./flow.js")).parsers.flow,
  // TypeScript
  typescript: async () => (await import("./typescript.js")).parsers.typescript,
  // Angular
  __ng_action: async () => (await import("./angular.js")).parsers.__ng_action,
  __ng_binding: async () => (await import("./angular.js")).parsers.__ng_binding,
  __ng_interpolation: async () =>
    (await import("./angular.js")).parsers.__ng_interpolation,
  __ng_directive: async () =>
    (await import("./angular.js")).parsers.__ng_directive,
  // Acorn and Espree
  acorn: async () => (await import("./acorn-and-espree.js")).parsers.acorn,
  espree: async () => (await import("./acorn-and-espree.js")).parsers.espree,
  // Meriyah
  meriyah: async () => (await import("./meriyah.js")).parsers.meriyah,
};

export default parsers;
