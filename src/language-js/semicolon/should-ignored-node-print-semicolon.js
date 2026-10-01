import { shouldAddContentEnd } from "../location/index.js";

function shouldIgnoredNodePrintSemicolon(node) {
  if (shouldAddContentEnd(node) && node.__contentEnd) {
    return true;
  }

  const { type } = node;

  if (
    type === "BreakStatement" ||
    type === "ContinueStatement" ||
    type === "DebuggerStatement" ||
    type === "VariableDeclaration"
  ) {
    return true;
  }

  if (type === "IfStatement") {
    return shouldIgnoredNodePrintSemicolon(node.alternate ?? node.consequent);
  }

  if (
    type === "ForInStatement" ||
    type === "ForOfStatement" ||
    type === "ForStatement" ||
    type === "LabeledStatement" ||
    type === "WithStatement" ||
    type === "WhileStatement"
  ) {
    return shouldIgnoredNodePrintSemicolon(node.body);
  }

  return false;
}

export { shouldIgnoredNodePrintSemicolon };
