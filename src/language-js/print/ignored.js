import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  locEnd,
  locStart,
  shouldIgnoredNodePrintSemicolon,
} from "../location/index.js";
import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { isForXStatementInitializerPath } from "./variable-declaration.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  // `shouldIgnoredNodePrintSemicolon` is true for every VariableDeclaration.
  // `for` heads already use `;` as a separator, so appending another one
  // yields `for (let i = 0;; i++)` (prettier/prettier#20171).
  if (
    options.semi &&
    shouldIgnoredNodePrintSemicolon(node) &&
    !isForXStatementInitializerPath(path)
  ) {
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
