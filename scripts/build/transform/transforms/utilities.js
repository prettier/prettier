function isIdentifier(node, name) {
  return node.type === "Identifier" && node.name === name;
}

function createIdentifier(name) {
  return { type: "Identifier", name };
}

function createStringLiteral(value) {
  return { type: "StringLiteral", value };
}

function createMemberExpression(path) {
  let node;

  for (const name of path.split(".")) {
    node = node
      ? {
          type: "MemberExpression",
          object: node,
          property: createIdentifier(name),
        }
      : createIdentifier(name);
  }

  return node;
}

export {
  createIdentifier,
  createMemberExpression,
  createStringLiteral,
  isIdentifier,
};
