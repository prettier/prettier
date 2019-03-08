"use strict";

//
// BEFORE:
//   [__something__].includes(__something__)
//   CONSTANT_CASE.includes(__something__)
//
// AFTER:
//   [__something__].indexOf(__something__) !== -1
//   CONSTANT_CASE.indexOf(__something__) !== -1
//

module.exports = ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      const node = path.node;
      const callee = node.callee;
      if (
        t.isMemberExpression(callee, { computed: false }) &&
        (t.isArrayExpression(callee.object) ||
          (t.isIdentifier(callee.object) &&
            (/^[A-Z_]+$/.test(callee.object.name) ||
              // https://github.com/eemeli/yaml/blob/1005d01/src/Anchors.js#L45
              callee.object.name === "names"))) &&
        t.isIdentifier(callee.property, { name: "includes" })
      ) {
        callee.property.name = "indexOf";
        path.replaceWith(t.binaryExpression("!==", node, t.numericLiteral(-1)));
      }
    }
  }
});
