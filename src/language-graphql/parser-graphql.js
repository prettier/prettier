"use strict";

const createError = require("../common/parser-create-error.js");
const tryCombinations = require("../utils/try-combinations.js");
const { hasPragma } = require("./pragma.js");
const { locStart, locEnd } = require("./loc.js");

function parseComments(ast) {
  const comments = [];
  const stack = [];
  let prev = null;
  let token = ast.startToken;
  while (token) {
    if (token.kind === "Punctuator" && token.value === "{") {
      stack.push(prev);
    } else if (token.kind === "Punctuator" && token.value === "}") {
      prev = stack.pop();
    }
    if (token.kind === "Comment") {
      const comment = {
        value: token.value,
        loc: {
          start: locStart(token),
          end: locEnd(token),
        },
      };
      if (prev) {
        prev.trailingComments = prev.trailingComments || [];
        prev.trailingComments.push(comment);
      } else {
        comments.push(comment);
      }
    }
    prev = token;
    token = token.next;
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
