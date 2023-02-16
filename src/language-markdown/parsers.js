const parsers = [
  {
    importPlugin: () => import("./parser-markdown.js"),
    parserNames: ["remark", "markdown"],
  },
  {
    importPlugin: () => import("./parser-mdx.js"),
    parserNames: ["mdx"],
  },
];

export default parsers;
