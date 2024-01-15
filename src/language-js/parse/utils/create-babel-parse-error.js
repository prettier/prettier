import createError from "../../../common/parser-create-error.js";

function createBabelParseError(error) {
  // babel error prints (line:column) with cols that are zero indexed
  // so we need our custom error
  let {
    message,
    loc: { line, column },
    reasonCode,
  } = error;

  if (reasonCode === "MissingPlugin" || reasonCode === "MissingOneOfPlugins") {
    message = "Unexpected token";
  }

  const suffix = ` (${line}:${column})`;
  if (message.endsWith(suffix)) {
    message = message.slice(0, -suffix.length);
  }

  return createError(message, {
    loc: { start: { line, column: column + 1 } },
    cause: error,
  });
}

export default createBabelParseError;
