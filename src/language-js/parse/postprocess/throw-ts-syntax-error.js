import createError from "../../../common/parser-create-error.js";

function throwSyntaxError(node, message) {
  const { start, end } = node.loc;
  throw createError(message, {
    loc: {
      start: { line: start.line, column: start.column + 1 },
      end: { line: end.line, column: end.column + 1 },
    },
  });
}

export default throwSyntaxError;
