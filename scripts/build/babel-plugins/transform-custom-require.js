"use strict";

//
// BEFORE:
//   eval("require")("./path/to/file")
//   eval("require")(identifier)
//
// AFTER:
//   require("./file")
//   require(identifier)
//

module.exports = function(babel) {
  const t = babel.types;

  return {
    visitor: {
      CallExpression(path) {
        const node = path.node;
        if (isEvalRequire(node)) {
          let arg = node.arguments[0];
          if (t.isLiteral(arg) && arg.value.startsWith(".")) {
            const value = "." + arg.value.substring(arg.value.lastIndexOf("/"));
            arg = t.stringLiteral(value);
          }
          path.replaceWith(t.callExpression(t.identifier("require"), [arg]));
        }
      }
    }
  };

  function isEvalRequire(node) {
    return (
      t.isCallExpression(node.callee) &&
      node.arguments.length === 1 &&
      t.isIdentifier(node.callee.callee, { name: "eval" }) &&
      node.callee.arguments.length === 1 &&
      t.isLiteral(node.callee.arguments[0], { value: "require" })
    );
  }
};
