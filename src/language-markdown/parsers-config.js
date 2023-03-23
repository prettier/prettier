export default [
  {
    importParsers: () => import("./parser-markdown.js"),
    parserNames: ["remark", "markdown", "mdx"],
  },
];
