const parsers = [
  {
    importPlugin: () => import("./babel.js"),
    parserNames: [
      "babel",
      "babel-flow",
      "babel-ts",
      "json",
      "json5",
      "json-stringify",
      "__js_expression",
      "__vue_expression",
      "__vue_ts_expression",
      "__vue_event_binding",
      "__vue_ts_event_binding",
      "__babel_estree",
    ],
  },
  {
    importPlugin: () => import("./flow.js"),
    parserNames: ["flow"],
  },
  {
    importPlugin: () => import("./typescript.js"),
    parserNames: ["typescript"],
  },
  {
    importPlugin: () => import("./angular.js"),
    parserNames: [
      "__ng_action",
      "__ng_binding",
      "__ng_interpolation",
      "__ng_directive",
    ],
  },
  {
    importPlugin: () => import("./acorn-and-espree.js"),
    parserNames: ["acorn", "espree"],
  },
  {
    importPlugin: () => import("./meriyah.js"),
    parserNames: ["meriyah"],
  },
];

export default parsers;
