import createParsers from "../utils/create-parsers.js";

const parsers = createParsers([
  [() => import("./parser-glimmer.js"), ["glimmer"]],
]);

export default parsers;
