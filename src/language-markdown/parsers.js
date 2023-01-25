const parsers = [
  {
    importPlugin: () => import("./parser-markdown.js"),
    parserNames: ["remark", "markdown", "mdx"],
  },
];

export default parsers;
