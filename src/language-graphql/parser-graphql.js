import createError from "../common/parser-create-error.js";
import { hasPragma } from "./pragma.js";
import { locStart, locEnd } from "./loc.js";

function parseComments(ast) {
  const comments = [];
  const { startToken, endToken } = ast.loc;
  for (let token = startToken; token !== endToken; token = token.next) {
    if (token.kind === "Comment") {
      comments.push(token);
    }
  }

  return comments;
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
    return createError(message, { loc: { start }, cause: error });
  }

  /* istanbul ignore next */
  return error;
}

async function parse(text /*, options */) {
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
