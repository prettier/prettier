"use strict";

//
// BEFORE:
//   if (!process.env.PRETTIER_TARGET_UNIVERSAL) {
//     foo();
//   }
//
// AFTER:
//   // in standalone mode: no output
//   // in regular mode:
//   foo();
//

module.exports = function() {
  return {
    visitor: {
      IfStatement(path, state) {
        const node = path.node;
        if (
          path.get("test").isUnaryExpression() &&
          path.get("test.argument").getSource() ===
            "process.env.PRETTIER_TARGET_UNIVERSAL"
        ) {
          if (state.opts.target === "universal") {
            path.replaceWithMultiple(node.consequent ? node.consequent.body : []);
          } else {
            path.replaceWithMultiple(node.consequent.body);
          }
        }
      }
    }
  };
};
