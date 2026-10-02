import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../location/index.js";
import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { shouldIgnoredNodePrintSemicolon } from "../semicolon/should-ignored-node-print-semicolon.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (options.semi && shouldIgnoredNodePrintSemicolon(path)) {
    text += ";";
  } else if (shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    text = `;${text}`;
  }

  if (node.type === "ClassExpression" && isNonEmptyArray(node.decorators)) {
    return [indent([softline, text]), softline];
  }

  return text;
}

export { printIgnored };
