import { hardline } from "../../document/index.js";
import { isLineComment } from "../../language-js/utilities/comment-types.js";
import { getExpressionParseResult } from "../utilities/get-expression-parse-result.js";

function printRawMdxExpression(node) {
  const { comments } = getExpressionParseResult(node.data.estree);
  const value = node.value.trim();

  if (comments.some(isLineComment)) {
    return ["{", hardline, value, hardline, "}"];
  }

  return ["{", value, "}"];
}

export { printRawMdxExpression };
