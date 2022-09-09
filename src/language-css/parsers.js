import createParsers from "../utils/create-parsers.js";

// TODO: switch these to just `postcss` and use `language` instead.
const parsers = createParsers([
  [() => import("./parser-postcss.js"), ["css", "less", "scss"]],
]);

export default parsers;
