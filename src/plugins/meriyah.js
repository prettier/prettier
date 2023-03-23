import createParsers from "../utils/create-parsers.js";

export const parsers = createParsers([
  {
    importParsers: () => import("../language-js/parse/meriyah.js"),
    parserNames: ["meriyah"],
  },
]);
export default { parsers };
