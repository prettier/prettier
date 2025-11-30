/* The argument is a duck type of AstPath, so we can use it in comment attach and ast massage */
function isMeaningfulEmptyStatement({ node, parent }) {
  if (node?.type !== "EmptyStatement") {
    return false;
  }

  if (parent.type === "IfStatement") {
    return parent.consequent === node || parent.alternate === node;
  }

  if (
    parent.type === "DoWhileStatement" ||
    parent.type === "ForInStatement" ||
    parent.type === "ForOfStatement" ||
    parent.type === "ForStatement" ||
    parent.type === "LabeledStatement" ||
    parent.type === "WithStatement" ||
    parent.type === "WhileStatement"
  ) {
    return parent.body === node;
  }

  return false;
}

export default isMeaningfulEmptyStatement;
