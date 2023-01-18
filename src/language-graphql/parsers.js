const parsers = [
  {
    importPlugin: () => import("./parser-graphql.js"),
    parserNames: ["graphql"],
  },
];

export default parsers;
