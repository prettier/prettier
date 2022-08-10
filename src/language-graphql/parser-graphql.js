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

function createParseError(error) {
  if (error?.name === "GraphQLError") {
    const {
      message,
      locations: [start],
    } = error;
    return createError(message, { start });
  }

  /* istanbul ignore next */
  return error;
}

async function parse(text /*, parsers, opts*/) {
  // Inline `import()` to avoid loading all the JS if we don't use it
  const { parse } = await import("graphql/language/parser.mjs");

  /** @type {any} */
  let ast;
  try {
    ast = parse(text, parseOptions);
  } catch (error) {
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
