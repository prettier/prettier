import createError from "../../../common/parser-create-error.js";

function createBabelParseError(error) {
  // babel error prints (line:column) with cols that are zero indexed
  // so we need our custom error
  const { message, loc } = error;

  return createError(message.replace(/ \(.*\)$/, ""), {
    loc: {
      start: {
        line: loc ? loc.line : 0,
        column: loc ? loc.column + 1 : 0,
      },
    },
    cause: error,
  });
}

export default createBabelParseError;
