import createError from "../../common/parser-create-error.js";

function throwSyntaxError(node, message) {
  const {
    startSourceSpan: { start },
    endSourceSpan: { end },
  } = node;
  throw createError(message, {
    loc: {
      start: { line: start.line, column: start.col + 1 },
      end: { line: end.line, column: end.col + 1 },
    },
  });
}

export default throwSyntaxError;
