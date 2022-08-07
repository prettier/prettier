import { createRequire } from "node:module";
import createError from "../common/parser-create-error.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

const require = createRequire(import.meta.url);

function parseComments(ast) {
  const comments = [];
  let { next } = ast.loc.startToken;
  while (next.kind !== "<EOF>") {
    if (next.kind === "Comment") {
      comments.push(next);
    }
    next = next.next;
  }

  return comments;
}

const parseOptions = {
  allowLegacyFragmentVariables: true,
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

  /** @type {any} */
  let ast;
  try {
    ast = parse(text, parseOptions);
  } catch (error) {
    throw createParseError(error);
  }

  ast.comments = parseComments(ast);
  return ast;
}

const graphql = {
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

export default graphql;
