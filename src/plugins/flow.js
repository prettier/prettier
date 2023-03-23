import createParsers from "../utils/create-parsers.js";

export const parsers = createParsers([
  {
    importParsers: () => import("../language-js/parse/flow.js"),
    parserNames: ["flow"],
  },
]);
export default { parsers };
