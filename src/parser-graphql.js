"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parser = require("graphql/language");
  try {
    const ast = parser.parse(text);
    return ast;
  } catch (error) {
    const GraphQLError = require("graphql/error").GraphQLError;
    if (error instanceof GraphQLError) {
      throw createError(error.message, {
        start: {
          line: error.locations[0].line,
          column: error.locations[0].column
        }
      });
    } else {
      throw error;
    }
  }
}

module.exports = parse;
