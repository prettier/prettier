import { isJsxElement } from "./node-types.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 */

// If we have nested conditional expressions, we want to print them in JSX mode
// if there's at least one JSXElement somewhere in the tree.
//
// A conditional expression chain like this should be printed in normal mode,
// because there aren't JSXElements anywhere in it:
//
// isA ? "A" : isB ? "B" : isC ? "C" : "Unknown";
//
// But a conditional expression chain like this should be printed in JSX mode,
// because there is a JSXElement in the last ConditionalExpression:
//
// isA ? "A" : isB ? "B" : isC ? "C" : <span className="warning">Unknown</span>;
//
// This type of ConditionalExpression chain is structured like this in the AST:
//
// ConditionalExpression {
//   test: ...,
//   consequent: ...,
//   alternate: ConditionalExpression {
//     test: ...,
//     consequent: ...,
//     alternate: ConditionalExpression {
//       test: ...,
//       consequent: ...,
//       alternate: ...,
//     }
//   }
// }
function conditionalExpressionChainContainsJsx(node) {
  // Given this code:
  //
  // // Using a ConditionalExpression as the consequent is uncommon, but should
  // // be handled.
  // A ? B : C ? D : E ? F ? G : H : I
  //
  // which has this AST:
  //
  // ConditionalExpression {
  //   test: Identifier(A),
  //   consequent: Identifier(B),
  //   alternate: ConditionalExpression {
  //     test: Identifier(C),
  //     consequent: Identifier(D),
  //     alternate: ConditionalExpression {
  //       test: Identifier(E),
  //       consequent: ConditionalExpression {
  //         test: Identifier(F),
  //         consequent: Identifier(G),
  //         alternate: Identifier(H),
  //       },
  //       alternate: Identifier(I),
  //     }
  //   }
  // }
  //
  // We don't care about whether each node was the test, consequent, or alternate
  // We are only checking if there's any JSXElements inside.
  const conditionalExpressions = [node];
  for (let index = 0; index < conditionalExpressions.length; index++) {
    const conditionalExpression = conditionalExpressions[index];
    for (const property of ["test", "consequent", "alternate"]) {
      const node = conditionalExpression[property];

      if (isJsxElement(node)) {
        return true;
      }

      if (node.type === "ConditionalExpression") {
        conditionalExpressions.push(node);
      }
    }
  }

  return false;
}

/**
 * Whether the `ConditionalExpression` the path points at is printed in "JSX
 * mode" by the default ternary printer, in which case it wraps its consequent
 * and alternate in parentheses.
 * @param {AstPath} path
 * @returns {boolean}
 */
function shouldPrintTernaryInJsxMode(path) {
  const { node } = path;

  if (
    isJsxElement(node.test) ||
    isJsxElement(node.consequent) ||
    isJsxElement(node.alternate)
  ) {
    return true;
  }

  // Find the outermost ConditionalExpression parent, the whole chain is
  // printed in JSX mode as soon as any of its nodes is a JSXElement.
  let currentParent;
  let previousParent;
  let index = 0;
  do {
    previousParent = currentParent ?? node;
    currentParent = path.getParentNode(index);
    index++;
  } while (
    currentParent?.type === "ConditionalExpression" &&
    currentParent.test !== previousParent
  );

  return conditionalExpressionChainContainsJsx(previousParent);
}

export { shouldPrintTernaryInJsxMode };
