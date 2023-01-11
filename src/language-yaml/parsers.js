const parsers = [
  {
    importPlugin: () => import("./parser-yaml.js"),
    parserNames: ["yaml"],
  },
];

export default parsers;
