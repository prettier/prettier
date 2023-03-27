import createParsers from "../utils/create-parsers.js";

export const parsers = createParsers([
  {
    importParsers: () => import("../language-js/parse/angular.js"),
    parserNames: [
      "__ng_action",
      "__ng_binding",
      "__ng_interpolation",
      "__ng_directive",
    ],
  },
]);
export default { parsers };
