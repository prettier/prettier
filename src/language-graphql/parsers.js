import graphqlParser from "./parser-graphql.js";

const parsers = {
  get graphql() {
    return graphqlParser.parsers.graphql;
  },
};

export default parsers;
