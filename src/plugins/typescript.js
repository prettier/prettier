import createParsers from "../utils/create-parsers.js";

export const parsers = createParsers([
  {
    importParsers: () => import("../language-js/parse/typescript.js"),
    parserNames: ["typescript"],
  },
]);
export default { parsers };
