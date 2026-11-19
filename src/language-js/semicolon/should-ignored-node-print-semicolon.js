import { isForXStatementInitializer } from "../utilities/is-for-x-statement-initializer.js";
import {
  isClassProperty,
  isStatementWithContentEnd,
} from "../utilities/node-types.js";

function shouldPrintSemicolon(node) {
  if (isClassProperty(node)) {
    return true;
  }

  if (isStatementWithContentEnd(node) && node.__contentEnd) {
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
    return shouldPrintSemicolon(node.alternate ?? node.consequent);
  }

  if (
    type === "ForInStatement" ||
    type === "ForOfStatement" ||
    type === "ForStatement" ||
    type === "LabeledStatement" ||
    type === "WithStatement" ||
    type === "WhileStatement"
  ) {
    return shouldPrintSemicolon(node.body);
  }

  return false;
}

function shouldIgnoredNodePrintSemicolon(path) {
  return !isForXStatementInitializer(path) && shouldPrintSemicolon(path.node);
}

export { shouldIgnoredNodePrintSemicolon };
