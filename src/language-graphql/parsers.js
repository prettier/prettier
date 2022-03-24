/* BUNDLE_REMOVE_START */
import graphqlParser from "./parser-graphql.js";
/* BUNDLE_REMOVE_END */

const parsers = {
  get graphql() {
    return /* require("./parser-graphql.js") */ graphqlParser.parsers.graphql;
  },
};

export default parsers;
