import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";

let acorn;
const getAcorn = () => {
  acorn ??= AcornParser.extend(acornJsx());
  return acorn;
};

const parse = (text, options) => {
  const comments = [];
  const ast = getAcorn().parse(text, {
    ...options,
    onComment: comments,
  });
  return Object.defineProperty({ ...ast, body: [] }, "raw", {
    value: { ast, text, comments },
  });
};

const parseExpressionAt = (text, position, options) => {
  const comments = [];
  const ast = getAcorn().parseExpressionAt(text, position, {
    ...options,
    onComment: comments,
  });
  return Object.defineProperty(
    { type: "Literal", value: 0, start: ast.start, end: ast.end },
    "raw",
    { value: { ast, text, comments } },
  );
};

export { parse, parseExpressionAt };
