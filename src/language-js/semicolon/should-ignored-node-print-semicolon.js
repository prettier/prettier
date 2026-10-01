import { shouldAddContentEnd } from "../location/index.js";
import { isForXStatementInitializer } from "../utilities/is-for-x-statement-initializer.js";

function shouldIgnoredNodePrintSemicolon(path) {
  if (isForXStatementInitializer(path)) {
    return false;
  }

  const { node } = path;

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
