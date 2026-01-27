import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
  hasNode,
  stripChainElementWrappers,
} from "../utilities/index.js";
import {
  isCallExpression,
  isMemberExpression,
  isReturnOrThrowStatement,
} from "../utilities/node-types.js";
import { returnArgumentHasLeadingComment } from "../utilities/return-statement-has-leading-comment.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 */

// TODO[@fisker]: Remove `needsParentheses`

/**
@param {AstPath} path
*/
function parentNeedsParentheses(path, options, needsParentheses) {
  const { node, key, parent } = path;

  switch (parent.type) {
    case "ReturnStatement":
    case "ThrowStatement":
      if (willReturnOrThrowStatementBreak(path, options)) {
        return false;
      }
      break;

    case "ParenthesizedExpression":
      return false;
    case "ClassDeclaration":
    case "ClassExpression":
      // Add parens around the extends clause of a class. It is needed for almost
      // all expressions.
      if (key === "superClass") {
        const superClass = stripChainElementWrappers(node);
        if (
          superClass.type === "ArrowFunctionExpression" ||
          superClass.type === "AssignmentExpression" ||
          superClass.type === "AwaitExpression" ||
          superClass.type === "BinaryExpression" ||
          superClass.type === "ConditionalExpression" ||
          superClass.type === "LogicalExpression" ||
          superClass.type === "NewExpression" ||
          superClass.type === "ObjectExpression" ||
          superClass.type === "SequenceExpression" ||
          superClass.type === "TaggedTemplateExpression" ||
          superClass.type === "UnaryExpression" ||
          superClass.type === "UpdateExpression" ||
          superClass.type === "YieldExpression" ||
          (superClass.type === "ClassExpression" &&
            isNonEmptyArray(superClass.decorators))
        ) {
          return true;
        }
      }
      break;

    case "ExportDefaultDeclaration":
      // `export default function` or `export default class` can't be followed by
      // anything after. So an expression like `export default (function(){}).toString()`
      // needs to be followed by a parentheses
      if (shouldWrapFunctionForExportDefault(path, options, needsParentheses)) {
        return true;
      }
      break;

    case "Decorator":
      if (
        key === "expression" &&
        !canDecoratorExpressionUnparenthesized(node)
      ) {
        return true;
      }
      break;

    case "TypeAnnotation":
      if (
        path.match(
          undefined,
          undefined,
          (node, key) =>
            key === "returnType" && node.type === "ArrowFunctionExpression",
        ) &&
        includesFunctionTypeInObjectType(node)
      ) {
        return true;
      }
      break;

    // A user typing `!foo instanceof Bar` probably intended
    // `!(foo instanceof Bar)`, so format to `(!foo) instance Bar` to what is
    // really happening
    case "BinaryExpression":
      if (
        key === "left" &&
        (parent.operator === "in" || parent.operator === "instanceof") &&
        node.type === "UnaryExpression"
      ) {
        return true;
      }
      break;

    case "VariableDeclarator":
      // Legacy syntax
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Invalid_for-in_initializer
      // `for (var a = 1 in b);`
      if (
        key === "init" &&
        path.match(
          undefined,
          undefined,
          (node, key) =>
            key === "declarations" && node.type === "VariableDeclaration",
          (node, key) => key === "left" && node.type === "ForInStatement",
        )
      ) {
        return true;
      }
      break;
  }
}

function willReturnOrThrowStatementBreak(path, options) {
  const { key, parent } = path;
  if (!(key === "argument" && isReturnOrThrowStatement(parent))) {
    return false;
  }

  /*
  When `ReturnStatement` or `ThrowStatement` breaks, parentheses will be added around it's argument.
  So don't need add parentheses again.
  But we can't know how the argument printed, so only matches cases that will break for sure
  */

  const { node } = path;

  if (
    (node.type === "SequenceExpression" ||
      node.type === "AssignmentExpression") &&
    returnArgumentHasLeadingComment(node, options)
  ) {
    return true;
  }

  return false;
}

/**
 * @param {AstPath} path
 * @returns {boolean}
 */
function shouldWrapFunctionForExportDefault(path, options, needsParentheses) {
  const { node, parent } = path;

  if (node.type === "FunctionExpression" || node.type === "ClassExpression") {
    return (
      parent.type === "ExportDefaultDeclaration" ||
      // in some cases the function is already wrapped
      // (e.g. `export default (function() {})();`)
      // in this case we don't need to add extra parens
      !needsParentheses(path, options)
    );
  }

  if (
    !hasNakedLeftSide(node) ||
    (parent.type !== "ExportDefaultDeclaration" &&
      needsParentheses(path, options))
  ) {
    return false;
  }

  return path.call(
    () => shouldWrapFunctionForExportDefault(path, options, needsParentheses),
    ...getLeftSidePathName(node),
  );
}

// Based on babel implementation
// https://github.com/nicolo-ribaudo/babel/blob/c4b88a4e5005364255f7e964fe324cf7bfdfb019/packages/babel-generator/src/node/index.ts#L111
function canDecoratorExpressionUnparenthesized(node) {
  if (node.type === "ChainExpression") {
    node = node.expression;
  }

  return (
    isDecoratorMemberExpression(node) ||
    (isCallExpression(node) &&
      // @ts-expect-error -- doesn't exists on `CallExpression`
      !node.optional &&
      isDecoratorMemberExpression(node.callee))
  );
}

function isDecoratorMemberExpression(node) {
  if (node.type === "Identifier") {
    return true;
  }

  if (isMemberExpression(node)) {
    return (
      !node.computed &&
      // @ts-expect-error -- doesn't exists on `MemberExpression`
      !node.optional &&
      node.property.type === "Identifier" &&
      isDecoratorMemberExpression(node.object)
    );
  }

  return false;
}

function includesFunctionTypeInObjectType(node) {
  return hasNode(
    node,
    (node) =>
      node.type === "ObjectTypeAnnotation" &&
      hasNode(node, (node) => node.type === "FunctionTypeAnnotation"),
  );
}

export { parentNeedsParentheses };
