import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  locEnd,
  locStart,
  shouldAddSemicolonToIgnoredNode,
} from "../location/index.js";
import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (options.semi && shouldAddSemicolonToIgnoredNode(node)) {
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
