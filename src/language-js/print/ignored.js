import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../location/index.js";
import { shouldIgnoredExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { shouldIgnoredNodePrintSemicolon } from "../semicolon/should-ignored-node-print-semicolon.js";
import { shouldPrintSemicolonAfterDeclaration } from "../semicolon/should-print-semicolon-after-declaration.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (options.semi) {
    if (shouldIgnoredNodePrintSemicolon(path)) {
      text += ";";
    }
  } else if (
    shouldIgnoredExpressionStatementPrintLeadingSemicolon(path, options)
  ) {
    text = `;${text}`;
  } else if (
    !text.endsWith(";") &&
    shouldPrintSemicolonAfterDeclaration(path, options)
  ) {
    text += ";";
  }

  if (node.type === "ClassExpression" && isNonEmptyArray(node.decorators)) {
    return [indent([softline, text]), softline];
  }

  return text;
}

export { printIgnored };
