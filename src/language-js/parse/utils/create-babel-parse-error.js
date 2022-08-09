import createError from "../../../common/parser-create-error.js";

function createBabelParseError(error) {
  // babel error prints (l:c) with cols that are zero indexed
  // so we need our custom error
  const { message, loc } = error;

  return createError(message.replace(/ \(.*\)/, ""), {
    start: {
      line: loc?.line ?? 0,
      column: loc?.column ?? 0,
    },
  });
}

export default createBabelParseError;
