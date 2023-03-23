export default [
  {
    importParsers: async () =>
      (await import("../language-js/parse/babel.js")).default,
    parserNames: [
      "babel",
      "babel-flow",
      "babel-ts",
      "__js_expression",
      "__vue_expression",
      "__vue_ts_expression",
      "__vue_event_binding",
      "__vue_ts_event_binding",
      "__babel_estree",
    ],
  },
  // JSON parsers are based on babel, bundle together to reduce package size
  {
    importParsers: async () =>
      (await import("../language-json/parser-json.js")).default,
    parserNames: ["json", "json5", "json-stringify"],
  },
];
