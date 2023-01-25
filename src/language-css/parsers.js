// TODO: switch these to just `postcss` and use `language` instead.
const parsers = [
  {
    importPlugin: () => import("./parser-postcss.js"),
    parserNames: ["css", "less", "scss"],
  },
];

export default parsers;
