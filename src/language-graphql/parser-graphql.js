import createError from "../common/parser-create-error.js";
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
  allowLegacyFragmentVariables: true,
};

let GraphQLError;
async function createParseError(error) {
  if (!GraphQLError) {
    ({ GraphQLError } = await import("graphql/error/GraphQLError"));
  }

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

let graphqlParse;
async function parse(text /*, parsers, opts*/) {
  if (!graphqlParse) {
    // Inline the require to avoid loading all the JS if we don't use it
    ({ parse: graphqlParse } = await import("graphql/language/parser"));
  }

  /** @type {any} */
  let ast;
  try {
    ast = graphqlParse(text, parseOptions);
  } catch (error) {
    throw await createParseError(error);
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
