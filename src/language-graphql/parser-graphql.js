import { GraphQLError, parse as parseGraphql } from "graphql";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

function parseComments(ast) {
  const comments = [];
  const { startToken, endToken } = ast.loc;
  for (let token = startToken; token !== endToken; token = token.next) {
    if (token.kind === "Comment") {
      comments.push({ ...token, loc: { start: token.start, end: token.end } });
    }
  }

  return comments;
}

const parseOptions = {
  allowLegacyFragmentVariables: true,
};

function createParseError(error) {
  /* c8 ignore next 3 */
  if (!(error instanceof GraphQLError)) {
    return error;
  }

  const {
    message,
    locations: [start],
  } = error;
  return createError(message, { loc: { start }, cause: error });
}

function parse(text /* , options */) {
  let ast;
  try {
    ast = parseGraphql(text, parseOptions);
  } catch (error) {
    throw createParseError(error);
  }

  // @ts-expect-error -- expected
  ast.comments = parseComments(ast);
  return ast;
}

export const graphql = {
  parse,
  astFormat: "graphql",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};
