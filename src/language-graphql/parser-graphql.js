// TODO[@fisker]: try inline import this module
// Inline the require to avoid loading all the JS if we don't use it
import { parse as parseGraphql } from "graphql/language/parser.mjs";
import { GraphQLError } from "graphql/error/GraphQLError.mjs";
import createError from "../common/parser-create-error.js";
import tryCombinations from "../utils/try-combinations.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

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
  const { result: ast, error } = tryCombinations(
    () => parseGraphql(text, { ...parseOptions }),
    () =>
      parseGraphql(text, {
        ...parseOptions,
        allowLegacySDLImplementsInterfaces: true,
      })
  );

  if (!ast) {
    throw createParseError(error);
  }

  ast.comments = parseComments(ast);
  removeTokens(ast);
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
