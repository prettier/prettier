import {
  group,
  hardline,
  indent,
  lineSuffixBoundary,
  softline,
} from "../../document/index.js";
import { isLineComment } from "../../language-js/utilities/comment-types.js";
import {
  CommentCheckFlags,
  hasComment,
} from "../../language-js/utilities/comments.js";
import { stripChainElementWrappers } from "../../language-js/utilities/strip-chain-element-wrappers.js";
import { printJsExpression } from "../acorn/printer.js";
import { getExpressionParseResult } from "../utilities/get-expression-parse-result.js";

async function printMdxExpressionContainer(textToDoc, print, path, options) {
  let expression;
  const doc = await printJsExpression(textToDoc, print, path, options, {
    __onHtmlBindingRoot(ast) {
      expression = stripChainElementWrappers(ast.node);
    },
  });

  // Comments that affect the outer braces:
  // - `{ // comment\n }`
  // - `{ /* comment */ fn() }`
  // - `{ fn() /* comment */ }`
  if (
    !hasComment(
      expression,
      (comment) =>
        isLineComment(comment) || comment.leading || comment.trailing,
    )
  ) {
    return ["{", doc, lineSuffixBoundary, "}"];
  }

  return group(
    ["{", indent([softline, doc]), softline, lineSuffixBoundary, "}"],
    { shouldBreak: hasComment(expression, CommentCheckFlags.Line) },
  );
}

function printRawMdxExpression(node) {
  const { comments } = getExpressionParseResult(node.data.estree);
  const value = node.value.trim();

  if (comments.some(isLineComment)) {
    return ["{", hardline, value, hardline, "}"];
  }

  return ["{", value, "}"];
}

export { printMdxExpressionContainer, printRawMdxExpression };
