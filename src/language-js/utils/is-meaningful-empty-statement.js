/* This argument is a duck type of path, so we can use it in comment attach and ast massage */
function isMeaningfulEmptyStatement({ node, parent }) {
  if (node?.type !== "EmptyStatement") {
    return false;
  }

  if (
    parent.type === "IfStatement" &&
    (parent.consequent === node || parent.alternate === node)
  ) {
    return true;
  }

  return (
    (parent.type === "LabeledStatement" ||
      parent.type === "WithStatement" ||
      parent.type === "ForStatement" ||
      parent.type === "WhileStatement" ||
      parent.type === "ForInStatement" ||
      parent.type === "ForOfStatement" ||
      parent.type === "DoWhileStatement") &&
    parent.body === node
  );
}

export default isMeaningfulEmptyStatement;
