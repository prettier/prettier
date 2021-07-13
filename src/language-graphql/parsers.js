"use strict";

module.exports = {
  get graphql() {
    return require("./parser-graphql").parsers.graphql;
  },
};
