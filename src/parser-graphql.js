"use strict";

const createError = require("./parser-create-error");

function parse(text) {
  // Inline the require to avoid loading all the JS if we don't use it
  const parser = require("graphql/language");
  try {
    const ast = parser.parse(text);
    return ast;
  } catch (error) {
    const { GraphQLError } = require("graphql/error");
    if (error instanceof GraphQLError) {
      const { message, locations: [{ line, column }] } = error;
      throw createError(message, {
        start: { line, column }
      });
    } else {
      throw error;
    }
  }
}

module.exports = parse;
