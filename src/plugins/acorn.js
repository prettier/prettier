import createParsers from "../utils/create-parsers.js";

export const parsers = createParsers([
  {
    importParsers: () => import("../language-js/parse/acorn.js"),
    parserNames: ["acorn"],
  },
  {
    importParsers: () => import("../language-js/parse/espree.js"),
    parserNames: ["espree"],
  },
]);
export default { parsers };
