import { stripComments } from "../utilities/strip-comments.js";

function shouldPrintSemicolonAfterDeclaration(path, options) {
  return (
    options.semi ||
    (endsWithBodylessDeclaration(path.node) &&
      isFollowedByBlockStatement(path, options))
  );
}

function endsWithBodylessDeclaration(node) {
  const key = getLastStatementChildKey(node);
  return key
    ? endsWithBodylessDeclaration(node[key])
    : (node?.type === "TSDeclareFunction" ||
        node?.type === "TSModuleDeclaration") &&
        !node.body;
}

function isFollowedByBlockStatement(path, options) {
  const { siblings, index, parent, key } = path;

  if (siblings) {
    for (let nextIndex = index + 1; nextIndex < siblings.length; nextIndex++) {
      const next = siblings[nextIndex];
      // Statement sequences omit empty statements.
      if (next.type !== "EmptyStatement") {
        return next.type === "BlockStatement";
      }
    }
    // A range's temporary Program can end just before an unformatted block.
    // Unlike printed siblings, empty statements outside the range stay put.
    const range = options.__range;
    return (
      parent.type === "Program" &&
      path.root === range?.ast &&
      stripComments(range).slice(range.rangeEnd).trimStart().startsWith("{")
    );
  }

  // The following block need not be a sibling of the declaration:
  // `for (;;) function f(); {}`.
  const childKey = getLastStatementChildKey(parent);
  return (
    childKey &&
    key === childKey &&
    path.callParent(() => isFollowedByBlockStatement(path, options))
  );
}

// Only traverse the final printed child. Closing braces, `else`, and the
// condition of a do/while are barriers, including when printing ignored text.
function getLastStatementChildKey(node) {
  switch (node?.type) {
    case "ExportNamedDeclaration":
    case "ExportDefaultDeclaration":
      return "declaration";
    case "IfStatement":
      return node.alternate ? "alternate" : "consequent";
    case "ForStatement":
    case "ForInStatement":
    case "ForOfStatement":
    case "WhileStatement":
    case "WithStatement":
    case "LabeledStatement":
      return "body";
  }
}

export { shouldPrintSemicolonAfterDeclaration };
