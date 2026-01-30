import {
  group,
  hardline,
  ifBreak,
  indent,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import {
  isCallExpression,
  isMemberExpression,
} from "../utilities/node-types.js";
import { shouldPrintTrailingComma } from "../utilities/should-print-trailing-comma.js";

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

const shouldPrintDeclareToken = (path) => {
  const { node } = path;

  if (isFlowDeclareNode(node)) {
    return (
      path.parent.type !== "DeclareExportDeclaration" &&
      // @ts-expect-error -- hermes doesn't support yet
      !node.implicitDeclare
    );
  }

  // TypeScript
  return node.declare;
};

/**
 * @param {AstPath} path
 * @returns {Doc}
 */
function printDeclareToken(path) {
  return shouldPrintDeclareToken(path) ? "declare " : "";
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

function printIfOrWhileConditionOrWithStatementObject(path, options, print) {
  const { node } = path;
  const property = node.type === "WithStatement" ? "object" : "test";
  const conditionDoc = print(property);

  if (shouldInlineCondition(node[property])) {
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

/**
 * @param {("es5" | "all")} [level]
 * @returns {Doc}
 */
function printTrailingComma(options, level = "es5") {
  return shouldPrintTrailingComma(options, level) ? ifBreak(",") : "";
}

export {
  printAbstractToken,
  printDanglingCommentsInList,
  printDeclareToken,
  printDefiniteToken,
  printIfOrWhileConditionOrWithStatementObject as printDoWhileStatementCondition,
  printIfOrWhileConditionOrWithStatementObject as printIfStatementCondition,
  printOptionalToken,
  printTrailingComma,
  printTypeScriptAccessibilityToken,
  printIfOrWhileConditionOrWithStatementObject as printWhileStatementCondition,
};
