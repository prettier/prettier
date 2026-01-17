import {
  group,
  hardline,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  isCallExpression,
  isMemberExpression,
} from "../utilities/index.js";

/**
@import AstPath from "../../common/ast-path.js"
@import {Doc} from "../../document/index.js"
@import {Comment} from "../types/estree.js"
*/

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printOptionalToken(path) {
  const { node } = path;
  if (
    !node.optional ||
    // It's an optional computed method parsed by typescript-estree.
    // "?" is printed in `printMethod`.
    (node.type === "Identifier" && node === path.parent.key)
  ) {
    return "";
  }
  if (
    isCallExpression(node) ||
    (isMemberExpression(node) && node.computed) ||
    node.type === "OptionalIndexedAccessType"
  ) {
    return "?.";
  }
  return "?";
}

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printDefiniteToken(path) {
  return path.node.definite ||
    path.match(
      undefined,
      (node, name) =>
        name === "id" && node.type === "VariableDeclarator" && node.definite,
    )
    ? "!"
    : "";
}

const isFlowDeclareNode = createTypeCheckFunction([
  "DeclareClass",
  "DeclareComponent",
  "DeclareFunction",
  "DeclareHook",
  "DeclareVariable",
  "DeclareExportDeclaration",
  "DeclareExportAllDeclaration",
  "DeclareOpaqueType",
  "DeclareTypeAlias",
  "DeclareEnum",
  "DeclareInterface",
]);

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printDeclareToken(path) {
  const { node } = path;

  return (
    // TypeScript
    node.declare ||
      // Flow
      (isFlowDeclareNode(node) &&
        path.parent.type !== "DeclareExportDeclaration")
      ? "declare "
      : ""
  );
}

const isTsAbstractNode = createTypeCheckFunction([
  "TSAbstractMethodDefinition",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);

/**
 * @param {AstPath} param0
 * @returns {Doc}
 */
function printAbstractToken({ node }) {
  return node.abstract || isTsAbstractNode(node) ? "abstract " : "";
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return hasComment(node, CommentCheckFlags.Leading) ? [" ", clause] : clause;
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return [" ", clause];
  }

  return indent([line, clause]);
}

function printTypeScriptAccessibilityToken(node) {
  return node.accessibility ? node.accessibility + " " : "";
}

const isLogicalNot = (node) =>
  node.type === "UnaryExpression" && node.operator === "!";

function shouldInlineCondition(node) {
  if (hasComment(node)) {
    return false;
  }

  /*
  Main purpose here is to avoid indent level change when switching to negative condition

  The following case:

  ```js
  if (!foo({
    bar
  }));
  ```

  does look nice, but once `!` is removed, it's hard to known how the `CallExpression` will print

  ```js
  if (foo({
    bar
  }));
  ```

  so we are not going to inline it.
  */

  // `!(a | b)` and `!!(a | b)`, but not `!!!(a | b)`
  if (!isLogicalNot(node)) {
    return false;
  }

  node = node.argument;
  node = isLogicalNot(node) ? node.argument : node;

  return node.type === "LogicalExpression";
}

function printIfOrWhileCondition(path, options, print) {
  const conditionDoc = print("test");

  if (shouldInlineCondition(path.node.test)) {
    return conditionDoc;
  }

  return group([indent([softline, conditionDoc]), softline]);
}

/**
@param {(comment: Comment) => boolean} [filter]
@returns {Doc}
*/
function printDanglingCommentsInList(path, options, filter) {
  const { node } = path;

  return hasComment(node, CommentCheckFlags.Dangling, filter)
    ? [
        indent([softline, printDanglingComments(path, options, { filter })]),
        hasComment(
          node,
          CommentCheckFlags.Dangling | CommentCheckFlags.Line,
          filter,
        )
          ? hardline
          : softline,
      ]
    : "";
}

export {
  adjustClause,
  printAbstractToken,
  printDanglingCommentsInList,
  printDeclareToken,
  printDefiniteToken,
  printIfOrWhileCondition as printDoWhileStatementCondition,
  printIfOrWhileCondition as printIfStatementCondition,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
  printIfOrWhileCondition as printWhileStatementCondition,
};
