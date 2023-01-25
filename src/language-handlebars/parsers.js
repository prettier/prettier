const parsers = [
  {
    importPlugin: () => import("./parser-glimmer.js"),
    parserNames: ["glimmer"],
  },
];

export default parsers;
