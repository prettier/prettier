export default [
  {
    importParsers: () => import("./parser-yaml.js"),
    parserNames: ["yaml"],
  },
];
