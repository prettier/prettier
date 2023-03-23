// TODO: switch these to just `postcss` and use `language` instead.
export default [
  {
    importParsers: () => import("./parser-postcss.js"),
    parserNames: ["css", "less", "scss"],
  },
];
