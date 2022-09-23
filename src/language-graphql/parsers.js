import createParsers from "../utils/create-parsers.js";

const parsers = createParsers([
  [() => import("./parser-graphql.js"), ["graphql"]],
]);

export default parsers;
