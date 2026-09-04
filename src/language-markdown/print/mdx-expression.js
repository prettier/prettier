import {
  group,
  hardline,
  indent,
  lineSuffixBoundary,
  softline,
} from "../../document/index.js";
import { getExpressionParseResult } from "../utilities/get-expression-parse-result.js";

function hasLineComment(comments) {
  return comments.some((comment) => comment.type === "Line");
}

function printMdxExpressionContainer(node, expressionDoc) {
  const { comments } = getExpressionParseResult(node.data.estree);

  if (comments.length === 0) {
    return ["{", expressionDoc, "}"];
  }

  if (node.data.estree.isProgram) {
    return [
      "{",
      hasLineComment(comments)
        ? [indent([hardline, expressionDoc]), hardline]
        : expressionDoc,
      "}",
    ];
  }

  return group([
    "{",
    indent([softline, expressionDoc]),
    softline,
    lineSuffixBoundary,
    "}",
  ]);
}

function printRawMdxExpression(node) {
  const { comments } = getExpressionParseResult(node.data.estree);
  const value = node.value.trim();

  if (hasLineComment(comments)) {
    return ["{", hardline, value, hardline, "}"];
  }

  return ["{", value, "}"];
}

export { printMdxExpressionContainer, printRawMdxExpression };
