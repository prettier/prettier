"use strict";

//
// BEFORE:
//   [__something__].includes(__something__)
//
// AFTER:
//   [__something__].indexOf(__something__) !== -1
//

module.exports = ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      const node = path.node;
      const callee = node.callee;
      if (
        t.isMemberExpression(callee, { computed: false }) &&
        t.isArrayExpression(callee.object) &&
        t.isIdentifier(callee.property, { name: "includes" })
      ) {
        callee.property.name = "indexOf";
        path.replaceWith(t.binaryExpression("!==", node, t.numericLiteral(-1)));
      }
    }
  }
});
