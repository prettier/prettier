import createParsers from "../../utils/create-parsers.js";

const parsers = createParsers([
  [
    () => import("./babel.js"),
    [
      "babel",
      "babel-flow",
      "babel-ts",
      "json",
      "json5",
      "json-stringify",
      "__js_expression",
      "__vue_expression",
      "__vue_ts_expression",
      "__vue_ts_expression",
      "__vue_event_binding",
      "__vue_ts_event_binding",
      "__babel_estree",
    ],
  ],
  [() => import("./flow.js"), ["flow"]],
  [() => import("./typescript.js"), ["typescript"]],
  [
    () => import("./angular.js"),
    ["__ng_binding", "__ng_interpolation", "__ng_directive"],
  ],
  [() => import("./acorn-and-espree.js"), ["acorn", "espree"]],
  [() => import("./meriyah.js"), ["meriyah"]],
]);

export default parsers;
