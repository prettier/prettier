import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import { shouldExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";

function printIgnored(path, options /* , print*/) {
  const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (
    options.semi &&
    (node.type === "BreakStatement" ||
      node.type === "ContinueStatement" ||
      node.type === "VariableDeclaration" ||
      ((node.type === "ExpressionStatement" ||
        node.type === "Directive" ||
        node.type === "ImportDeclaration" ||
        node.type === "ExportDefaultDeclaration" ||
        node.type === "ExportNamedDeclaration" ||
        node.type === "ExportAllDeclaration") &&
        node.__contentEnd))
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
