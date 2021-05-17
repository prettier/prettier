"use strict";

const createError = require("../common/parser-create-error");
const tryCombinations = require("../utils/try-combinations");
const { hasPragma } = require("./pragma");
const { locStart, locEnd } = require("./loc");

function parseComments(ast) {
  const comments = [];
  const { startToken } = ast.loc;
  let { next } = startToken;
  while (next.kind !== "<EOF>") {
    if (next.kind === "Comment") {
      Object.assign(next, {
        // The Comment token's column starts _after_ the `#`,
        // but we need to make sure the node captures the `#`
        column: next.column - 1,
      });
      comments.push(next);
    }
    next = next.next;
  }

  return comments;
}

function removeTokens(node) {
  if (node && typeof node === "object") {
    delete node.startToken;
    delete node.endToken;
    delete node.prev;
    delete node.next;
    for (const key in node) {
      removeTokens(node[key]);
    }
  }
  return node;
}

const parseOptions = {
  allowLegacySDLImplementsInterfaces: false,
  experimentalFragmentVariables: true,
};

function createParseError(error) {
  const { GraphQLError } = require("graphql/error/GraphQLError");
  if (error instanceof GraphQLError) {
    const {
      message,
      locations: [start],
    } = error;
    return createError(message, { start });
  }

  /* istanbul ignore next */
  return error;
}

function parse(text /*, parsers, opts*/) {
  // Inline the require to avoid loading all the JS if we don't use it
  const { parse } = require("graphql/language/parser");
  const { result: ast, error } = tryCombinations(
    () => parse(text, { ...parseOptions }),
    () =>
      parse(text, { ...parseOptions, allowLegacySDLImplementsInterfaces: true })
  );

  if (!ast) {
    throw createParseError(error);
  }

  ast.comments = parseComments(ast);
  removeTokens(ast);
  return ast;
}

module.exports = {
  parsers: {
    graphql: {
      parse,
      astFormat: "graphql",
      hasPragma,
      locStart,
      locEnd,
    },
  },
};
