import createError from "../../../common/parser-create-error.js";

const parseExpressionErrorMessagePrefix =
  "Unexpected parseExpression() input: ";

function createBabelParseError(error) {
  let { message, loc, reasonCode } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  // babel error prints (line:column) with cols that are zero indexed
  // so we need our custom error
  const { line, column } = loc;

  let cause = error;
  if (reasonCode === "MissingPlugin" || reasonCode === "MissingOneOfPlugins") {
    message = "Unexpected token.";
    cause = undefined;
  }

  const suffix = ` (${line}:${column})`;
  if (message.endsWith(suffix)) {
    message = message.slice(0, -suffix.length);
  }

  if (message.startsWith(parseExpressionErrorMessagePrefix)) {
    message = message.slice(parseExpressionErrorMessagePrefix.length);
  }

  return createError(message, {
    loc: { start: { line, column: column + 1 } },
    cause,
  });
}

export default createBabelParseError;
