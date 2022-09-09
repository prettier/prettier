import createParsers from "../utils/create-parsers.js";

const parsers = createParsers([
  [() => import("./parser-markdown.js"), ["remark", "markdown", "mdx"]],
]);

export default parsers;
