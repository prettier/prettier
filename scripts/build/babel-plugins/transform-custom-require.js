"use strict";

//
// BEFORE:
//   $$$r("path/to/file")
//
// AFTER:
//   require("./file")
//

module.exports = function(babel) {
  const t = babel.types;
  return {
    visitor: {
      CallExpression: function(path) {
        const node = path.node;
        if (
          path.get("callee").isIdentifier({ name: "$$$r" }) &&
          node.arguments.length === 1 &&
          path.get("arguments.0").isStringLiteral()
        ) {
          const value = node.arguments[0].value;
          const parts = value.split("/");
          path.replaceWith(
            t.callExpression(t.identifier("require"), [
              t.stringLiteral(`./${parts[parts.length - 1]}`)
            ])
          );
        }
      }
    }
  };
};
