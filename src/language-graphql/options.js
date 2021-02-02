"use strict";

// format based on https://github.com/prettier/prettier/blob/master/src/main/core-options.js
module.exports = {
  graphqlCurlySpacing: {
    category: "Other",
    type: "boolean",
    default: true,
    description: "Put spaces between curly braces for GraphQL.",
    oppositeDescription: "Do not put spaces between curly braces for GraphQL.",
  },
};
