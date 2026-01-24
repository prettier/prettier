import { group, indent, softline } from "../../document/index.js";
import {
  isCallExpression,
  isMemberExpression,
  startsWithNoLookaheadToken,
} from "../utilities/index.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

function printAwaitExpression(path, options, print) {
  const { node } = path;
  /** @type{Doc[]} */
  let parts = ["await"];
  if (node.argument) {
    parts.push(" ", print("argument"));
    const { parent } = path;
    if (
      (isCallExpression(parent) && parent.callee === node) ||
      (isMemberExpression(parent) && parent.object === node)
    ) {
      parts = [indent([softline, ...parts]), softline];
      // avoid printing `await (await` on one line
      const parentAwaitOrBlock = path.findAncestor(
        (node) =>
          node.type === "AwaitExpression" || node.type === "BlockStatement",
      );
      if (
        parentAwaitOrBlock?.type !== "AwaitExpression" ||
        !startsWithNoLookaheadToken(
          parentAwaitOrBlock.argument,
          (leftmostNode) => leftmostNode === node,
        )
      ) {
        return group(parts);
      }
    }
  }
  return parts;
}

export { printAwaitExpression };
