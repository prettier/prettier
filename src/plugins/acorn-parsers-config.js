export default [
  {
    importParsers: () => import("../language-js/parse/acorn.js"),
    parserNames: ["acorn"],
  },
  {
    importParsers: () => import("../language-js/parse/espree.js"),
    parserNames: ["espree"],
  },
];
