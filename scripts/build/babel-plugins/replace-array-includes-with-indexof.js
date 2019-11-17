"use strict";

//
// BEFORE:
//   foo.includes(bar)
//
// AFTER:
//   foo.indexOf(bar) !== -1
//

// this plugin also replace `string.includes`,
// filename is not changed
// because it's temporary use for node@4 support

module.exports = ({ types: t }) => ({
  visitor: {
    CallExpression(path) {
      const node = path.node;
      const callee = node.callee;
      if (
        t.isMemberExpression(callee, { computed: false }) &&
        t.isIdentifier(callee.property, { name: "includes" })
      ) {
        callee.property.name = "indexOf";
        path.replaceWith(t.binaryExpression("!==", node, t.numericLiteral(-1)));
      }
    }
  }
});
