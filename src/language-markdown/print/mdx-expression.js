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

  if (!hasComment(expression)) {
    return ["{", doc, lineSuffixBoundary, "}"];
  }

  if (hasComment(expression, CommentCheckFlags.Dangling)) {
    return [
      "{",
      hasComment(expression, CommentCheckFlags.Line)
        ? [indent([hardline, doc]), hardline]
        : doc,
      "}",
    ];
  }

  return group([
    "{",
    indent([softline, doc]),
    softline,
    lineSuffixBoundary,
    "}",
  ]);
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
