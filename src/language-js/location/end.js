/**
@import {Node, Comment} from "../types/estree.js";
*/

/**
@param {Node | Comment} node
@return {number}
*/
function locEnd(node) {
  if (node.type === "BreakStatement" || node.type === "ContinueStatement") {
    const start = locStart(node);
    return node.label
      ? locEnd(node.label)
      : start +
          (node.type === "BreakStatement" ? "break".length : "continue".length);
  }

  if (node.type === "VariableDeclaration") {
    const lastDeclaration = node.declarations.at(-1);
    return locEnd(lastDeclaration);
  }

  if (node.type === "IfStatement") {
    return locEnd(node.alternate ?? node.consequent);
  }

  if (
    (node.type === "ExpressionStatement" ||
      node.type === "Directive" ||
      node.type === "ImportDeclaration" ||
      node.type === "ExportDefaultDeclaration" ||
      node.type === "ExportNamedDeclaration" ||
      node.type === "ExportAllDeclaration") &&
    node.__contentEnd
  ) {
    return node.__contentEnd;
  }

  return locEndWithFullText(node);
}

export { locEnd };
