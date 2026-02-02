import {
  addDanglingComment,
  addLeadingComment,
  addTrailingComment,
} from "../../main/comments/utilities.js";
import getNextNonSpaceNonCommentCharacter from "../../utilities/get-next-non-space-non-comment-character.js";
import getNextNonSpaceNonCommentCharacterIndex from "../../utilities/get-next-non-space-non-comment-character-index.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import { getCallArguments } from "../utilities/call-arguments.js";
import { isInsideCallOrNewExpressionParentheses } from "../utilities/call-or-new-expression-parentheses.js";
import { isBlockComment, isLineComment } from "../utilities/comment-types.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import { getFunctionParameters } from "../utilities/function-parameters.js";
import { isMethod } from "../utilities/is-method.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import { isPrettierIgnoreComment } from "../utilities/is-prettier-ignore-comment.js";
import { isTypeCastComment } from "../utilities/is-type-cast-comment.js";
import {
  isArrayType,
  isBinaryCastExpression,
  isCallLikeExpression,
  isCallOrNewExpression,
  isConditionalType,
  isIntersectionType,
  isMemberExpression,
  isUnionType,
} from "../utilities/node-types.js";
import { stripComments } from "../utilities/strip-comments.js";
import { handleForXComments } from "./attach/handle-for-x-statement.js";
import { handleIfStatementComments } from "./attach/handle-if-statement-comments.js";
import { handleWhileLikeComments } from "./attach/handle-while-like-comments.js";
import {
  addBlockOrNotComment,
  addBlockStatementFirstComment,
  isSingleLineComment,
} from "./attach/utilities.js";

/**
@import {Node, Comment, NodeMap} from "../types/estree.js";
*/

/**
@typedef {{
  comment: Comment,
  precedingNode: Node,
  enclosingNode: Node,
  followingNode: Node,
  text: string,
  options: any,
  ast: NodeMap["File"] | NodeMap["Program"],
  isLastComment: boolean,
  placement: "ownLine" | "endOfLine" | "remaining"
}} CommentContext
*/

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleOwnLineComment(context) {
  return [
    handleCommentInEmptyParens,
    handleIgnoreComments,
    handleConditionalExpressionComments,
    handleLastFunctionParameterComments,
    handleMemberExpressionComments,
    handleIfStatementComments,
    handleWhileLikeComments,
    handleTryStatementComments,
    handleClassComments,
    handleForXComments,
    handleUnionTypeComments,
    handleMatchOrPatternComments,
    handleOnlyComments,
    handleModuleSpecifiersComments,
    handleAssignmentPatternComments,
    handleMethodNameComments,
    handleLabeledStatementComments,
    handleNestedConditionalExpressionComments,
    handleCommentsInDestructuringPattern,
    handleTSMappedTypeComments,
    handleBinaryCastExpressionComment,
  ].some((fn) => fn(context));
}

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleEndOfLineComment(context) {
  return [
    handleCommentInEmptyParens,
    handleClosureTypeCastComments,
    handleLastFunctionParameterComments,
    handleConditionalExpressionComments,
    handleModuleSpecifiersComments,
    handleIfStatementComments,
    handleWhileLikeComments,
    handleTryStatementComments,
    handleClassComments,
    handleForXComments,
    handleLabeledStatementComments,
    handleCallExpressionComments,
    handlePropertyComments,
    handleOnlyComments,
    handleVariableDeclaratorComments,
    handleSwitchDefaultCaseComments,
    handleLastUnionElementInExpression,
    handleLastBinaryOperatorOperand,
    handleTSMappedTypeComments,
    handleArrowExpressionComments,
    handlePropertySignatureComments,
    handleBinaryCastExpressionComment,
  ].some((fn) => fn(context));
}

/**
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleRemainingComment(context) {
  return [
    handleCommentInEmptyParens,
    handleIgnoreComments,
    handleIfStatementComments,
    handleWhileLikeComments,
    handleForXComments,
    handleMethodNameComments,
    handleOnlyComments,
    handleTSMappedTypeComments,
    handleCommentAfterArrowParams,
    handleFunctionNameComments,
    handleTSFunctionTrailingComments,
    handleBinaryCastExpressionComment,
  ].some((fn) => fn(context));
}

function handleClosureTypeCastComments({ comment, followingNode }) {
  if (followingNode && isTypeCastComment(comment)) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    (enclosingNode?.type !== "TryStatement" &&
      enclosingNode?.type !== "CatchClause") ||
    !followingNode
  ) {
    return false;
  }

  if (enclosingNode.type === "CatchClause" && precedingNode) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "TryStatement") {
    addBlockOrNotComment(followingNode.finalizer, comment);
    return true;
  }

  if (followingNode.type === "CatchClause") {
    addBlockOrNotComment(followingNode.body, comment);
    return true;
  }

  return false;
}

function handleMemberExpressionComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    isMemberExpression(enclosingNode) &&
    followingNode?.type === "Identifier"
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleNestedConditionalExpressionComments({
  comment,
  enclosingNode,
  followingNode,
  options,
}) {
  if (!options.experimentalTernaries) {
    return false;
  }

  const enclosingIsCond =
    enclosingNode?.type === "ConditionalExpression" ||
    isConditionalType(enclosingNode);

  if (!enclosingIsCond) {
    return false;
  }

  const followingIsCond =
    followingNode?.type === "ConditionalExpression" ||
    isConditionalType(followingNode);

  if (followingIsCond) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleConditionalExpressionComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
  options,
}) {
  const isSameLineAsPrecedingNode =
    precedingNode &&
    !hasNewlineInRange(text, locEnd(precedingNode), locStart(comment));

  if (
    (!precedingNode || !isSameLineAsPrecedingNode) &&
    (enclosingNode?.type === "ConditionalExpression" ||
      isConditionalType(enclosingNode)) &&
    followingNode
  ) {
    if (
      options.experimentalTernaries &&
      enclosingNode.alternate === followingNode &&
      !(
        isBlockComment(comment) &&
        !hasNewlineInRange(
          options.originalText,
          locStart(comment),
          locEnd(comment),
        )
      )
    ) {
      addDanglingComment(enclosingNode, comment);
      return true;
    }
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

const isClassLikeNode = createTypeCheckFunction([
  "ClassDeclaration",
  "ClassExpression",
  "DeclareClass",
  "DeclareInterface",
  "InterfaceDeclaration",
  "TSInterfaceDeclaration",
]);
function handleClassComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (isClassLikeNode(enclosingNode)) {
    // @ts-expect-error -- Safe
    const { decorators } = enclosingNode;
    if (isNonEmptyArray(decorators) && !(followingNode?.type === "Decorator")) {
      addTrailingComment(decorators.at(-1), comment);
      return true;
    }

    if (enclosingNode.body && followingNode === enclosingNode.body) {
      addBlockStatementFirstComment(enclosingNode.body, comment);
      return true;
    }

    // Don't add leading comments to `implements`, `extends`, `mixins` to
    // avoid printing the comment after the keyword.
    if (followingNode) {
      // @ts-expect-error -- Safe
      const { superClass } = enclosingNode;
      if (
        superClass &&
        followingNode === superClass &&
        precedingNode &&
        (precedingNode === enclosingNode.id ||
          precedingNode === enclosingNode.typeParameters)
      ) {
        addTrailingComment(precedingNode, comment);
        return true;
      }

      for (const prop of ["implements", "extends", "mixins"]) {
        if (enclosingNode[prop] && followingNode === enclosingNode[prop][0]) {
          if (
            precedingNode &&
            (precedingNode === enclosingNode.id ||
              precedingNode === enclosingNode.typeParameters ||
              precedingNode === superClass)
          ) {
            addTrailingComment(precedingNode, comment);
          } else {
            addDanglingComment(enclosingNode, comment, prop);
          }
          return true;
        }
      }
    }
  }
  return false;
}

const isPropertyLikeNode = createTypeCheckFunction([
  "ClassMethod",
  "ClassProperty",
  "PropertyDefinition",
  "TSAbstractPropertyDefinition",
  "TSAbstractMethodDefinition",
  "TSDeclareMethod",
  "MethodDefinition",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractAccessorProperty",
  "TSParameterProperty",
]);
function handleMethodNameComments({
  placement,
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (
    enclosingNode &&
    precedingNode &&
    getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) === "(" &&
    // "MethodDefinition" is handled in `canAttachComment`
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "TSDeclareMethod" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    precedingNode.type === "Identifier" &&
    enclosingNode.key === precedingNode &&
    // special Property case: { key: /*comment*/(value) };
    // comment should be attached to value instead of key
    getNextNonSpaceNonCommentCharacter(text, locEnd(precedingNode)) !== ":"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (
    isPropertyLikeNode(enclosingNode) &&
    !followingNode &&
    placement === "remaining"
  ) {
    addTrailingComment(
      getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) === "("
        ? precedingNode
        : enclosingNode,
      comment,
    );
    return true;
  }

  // Print comments between decorators and class methods as a trailing comment
  // on the decorator node instead of the method node
  if (
    precedingNode?.type === "Decorator" &&
    isPropertyLikeNode(enclosingNode) &&
    (isLineComment(comment) || placement === "ownLine")
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

const isFunctionLikeNode = createTypeCheckFunction([
  "FunctionDeclaration",
  "FunctionExpression",
  "ClassMethod",
  "MethodDefinition",
  "ObjectMethod",
]);
function handleFunctionNameComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) !== "(") {
    return false;
  }
  if (precedingNode && isFunctionLikeNode(enclosingNode)) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleCommentAfterArrowParams({ comment, enclosingNode, text }) {
  if (enclosingNode?.type !== "ArrowFunctionExpression") {
    return false;
  }

  const index = getNextNonSpaceNonCommentCharacterIndex(text, locEnd(comment));
  if (index !== false && text.slice(index, index + 2) === "=>") {
    addDanglingComment(enclosingNode, comment, "commentBeforeArrow");
    return true;
  }

  return false;
}

function isInArgumentOrParameterParentheses(node, comment, options) {
  const commentStart = locStart(comment);
  const nodeEnd = locEnd(node);
  if (commentStart >= nodeEnd) {
    return false;
  }

  const commentEnd = locEnd(comment);
  const nodeStart = locStart(node);
  if (commentEnd <= nodeStart) {
    return false;
  }

  const text = stripComments(options);
  return (
    text.slice(0, locStart(comment)).trimEnd().endsWith("(") &&
    text.slice(locEnd(comment)).trimStart().startsWith(")")
  );
}

const isFlowComponent = createTypeCheckFunction([
  "ComponentDeclaration",
  "DeclareComponent",
  "ComponentTypeAnnotation",
]);

function handleCommentInEmptyParens({ comment, enclosingNode, options }) {
  if (!enclosingNode) {
    return false;
  }

  if (
    isCallLikeExpression(enclosingNode) &&
    getCallArguments(enclosingNode).length === 0 &&
    isInArgumentOrParameterParentheses(enclosingNode, comment, options)
  ) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.

  const functionNode =
    isRealFunctionLikeNode(enclosingNode) ||
    isFlowComponent(enclosingNode) ||
    enclosingNode.type === "HookTypeAnnotation"
      ? enclosingNode
      : enclosingNode.type === "MethodDefinition" ||
          enclosingNode.type === "TSAbstractMethodDefinition" ||
          (enclosingNode.type === "Property" && isMethod(enclosingNode))
        ? enclosingNode.value
        : undefined;

  if (
    functionNode &&
    getFunctionParameters(functionNode).length === 0 &&
    isInArgumentOrParameterParentheses(functionNode, comment, options)
  ) {
    addDanglingComment(functionNode, comment);
    return true;
  }

  return false;
}

function handleLastFunctionParameterComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  // Flow function type definitions
  if (
    precedingNode?.type === "FunctionTypeParam" &&
    enclosingNode?.type === "FunctionTypeAnnotation" &&
    followingNode?.type !== "FunctionTypeParam"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // "DeclareComponent" and "ComponentTypeAnnotation" definitions
  if (
    precedingNode?.type === "ComponentTypeParameter" &&
    (enclosingNode?.type === "DeclareComponent" ||
      enclosingNode?.type === "ComponentTypeAnnotation") &&
    followingNode?.type !== "ComponentTypeParameter"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Real functions and TypeScript function type definitions
  if (
    (precedingNode?.type === "Identifier" ||
      precedingNode?.type === "AssignmentPattern" ||
      precedingNode?.type === "ObjectPattern" ||
      precedingNode?.type === "ArrayPattern" ||
      precedingNode?.type === "RestElement" ||
      precedingNode?.type === "TSParameterProperty") &&
    isRealFunctionLikeNode(enclosingNode) &&
    getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) === ")"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // "ComponentParameter" definitions
  if (
    (precedingNode?.type === "ComponentParameter" ||
      precedingNode?.type === "RestElement") &&
    (enclosingNode?.type === "ComponentDeclaration" ||
      enclosingNode?.type === "DeclareComponent") &&
    getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) === ")"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Comment between function parameters parentheses and function body
  if (
    !isBlockComment(comment) &&
    followingNode?.type === "BlockStatement" &&
    isFunctionLikeNode(enclosingNode)
  ) {
    const functionBody =
      enclosingNode.type === "MethodDefinition"
        ? enclosingNode.value.body
        : enclosingNode.body;

    if (functionBody === followingNode) {
      const characterAfterCommentIndex =
        getNextNonSpaceNonCommentCharacterIndex(text, locEnd(comment));
      if (characterAfterCommentIndex === locStart(followingNode)) {
        addBlockStatementFirstComment(followingNode, comment);
        return true;
      }
    }
  }

  return false;
}

function handleLabeledStatementComments({ comment, enclosingNode }) {
  if (enclosingNode?.type === "LabeledStatement") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleCallExpressionComments({
  comment,
  precedingNode,
  enclosingNode,
  options,
}) {
  if (
    isCallOrNewExpression(enclosingNode) &&
    enclosingNode.callee === precedingNode &&
    enclosingNode.arguments.length > 0 &&
    isInsideCallOrNewExpressionParentheses(enclosingNode, comment, options)
  ) {
    addLeadingComment(enclosingNode.arguments[0], comment);
    return true;
  }
  return false;
}

function handleUnionTypeComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (isUnionType(enclosingNode)) {
    if (isPrettierIgnoreComment(comment)) {
      followingNode.prettierIgnore = true;
      comment.unignore = true;
    }
    if (precedingNode) {
      addTrailingComment(precedingNode, comment);
      return true;
    }
    return false;
  }

  if (isUnionType(followingNode) && isPrettierIgnoreComment(comment)) {
    // @ts-expect-error -- Fix me
    followingNode.types[0].prettierIgnore = true;
    comment.unignore = true;
  }

  return false;
}

function handleMatchOrPatternComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (enclosingNode && enclosingNode.type === "MatchOrPattern") {
    if (isPrettierIgnoreComment(comment)) {
      followingNode.prettierIgnore = true;
      comment.unignore = true;
    }
    if (precedingNode) {
      addTrailingComment(precedingNode, comment);
      return true;
    }
    return false;
  }

  if (
    followingNode &&
    followingNode.type === "MatchOrPattern" &&
    isPrettierIgnoreComment(comment)
  ) {
    followingNode.types[0].prettierIgnore = true;
    comment.unignore = true;
  }

  return false;
}

function handlePropertyComments({ comment, enclosingNode }) {
  if (isObjectProperty(enclosingNode)) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleOnlyComments({ comment, enclosingNode, ast, isLastComment }) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast?.body?.length === 0) {
    if (isLastComment) {
      addDanglingComment(ast, comment);
    } else {
      addLeadingComment(ast, comment);
    }
    return true;
  }

  if (
    enclosingNode?.type === "Program" &&
    enclosingNode.body.length === 0 &&
    !isNonEmptyArray(enclosingNode.directives)
  ) {
    if (isLastComment) {
      addDanglingComment(enclosingNode, comment);
    } else {
      addLeadingComment(enclosingNode, comment);
    }
    return true;
  }

  return false;
}

function handleModuleSpecifiersComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (
    enclosingNode?.type === "ImportSpecifier" ||
    enclosingNode?.type === "ExportSpecifier"
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  const isImportDeclaration =
    precedingNode?.type === "ImportSpecifier" &&
    enclosingNode?.type === "ImportDeclaration";
  const isExportDeclaration =
    precedingNode?.type === "ExportSpecifier" &&
    enclosingNode?.type === "ExportNamedDeclaration";
  if (
    (isImportDeclaration || isExportDeclaration) &&
    hasNewline(text, locEnd(comment))
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleAssignmentPatternComments({ comment, enclosingNode }) {
  if (enclosingNode?.type === "AssignmentPattern") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

const isAssignmentLikeNode = createTypeCheckFunction([
  "VariableDeclarator",
  "AssignmentExpression",
  "TypeAlias",
  "TSTypeAliasDeclaration",
]);
const isComplexExprNode = createTypeCheckFunction([
  "ObjectExpression",
  "ArrayExpression",
  "TemplateLiteral",
  "TaggedTemplateExpression",
  "ObjectTypeAnnotation",
  "TSTypeLiteral",
]);
function handleVariableDeclaratorComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    isAssignmentLikeNode(enclosingNode) &&
    followingNode &&
    (isComplexExprNode(followingNode) || isBlockComment(comment))
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleTSFunctionTrailingComments({
  comment,
  enclosingNode,
  precedingNode,
  followingNode,
  text,
}) {
  if (
    !followingNode &&
    (enclosingNode?.type === "TSMethodSignature" ||
      enclosingNode?.type === "TSDeclareFunction" ||
      enclosingNode?.type === "TSAbstractMethodDefinition") &&
    (!precedingNode || precedingNode !== enclosingNode.returnType) &&
    getNextNonSpaceNonCommentCharacter(text, locEnd(comment)) === ";"
  ) {
    addTrailingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleIgnoreComments({ comment, enclosingNode, followingNode }) {
  if (
    isPrettierIgnoreComment(comment) &&
    enclosingNode?.type === "TSMappedType" &&
    followingNode === enclosingNode.key
  ) {
    enclosingNode.prettierIgnore = true;
    comment.unignore = true;
    return true;
  }
}

/**
@param {NodeMap["TSMappedType"]} node
@param {Comment} comment
*/
function isBeforeMappedTypeOpeningBracket(node, comment, options) {
  const bracketIndex = stripComments(options).indexOf("[", locStart(node));
  return locEnd(comment) < bracketIndex;
}

function handleTSMappedTypeComments({ comment, enclosingNode, options }) {
  if (enclosingNode?.type !== "TSMappedType") {
    return;
  }

  if (isBeforeMappedTypeOpeningBracket(enclosingNode, comment, options)) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
}

function handleSwitchDefaultCaseComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "SwitchCase" ||
    enclosingNode.test ||
    !followingNode ||
    followingNode !== enclosingNode.consequent[0]
  ) {
    return false;
  }

  if (followingNode.type === "BlockStatement" && isLineComment(comment)) {
    addBlockStatementFirstComment(followingNode, comment);
  } else {
    addDanglingComment(enclosingNode, comment);
  }

  return true;
}

/**
 * Handle `Comment2`, `Comment4`, `Comment6`.
 *
 *   type Foo = (
 *     | "thing1" // Comment1
 *     | "thing2" // Comment2
 *   )[];
 *
 *   type Foo = (
 *     | "thing1" // Comment3
 *     | "thing2" // Comment4
 *   ) & Bar;
 *
 *   type Foo = (
 *     | "thing1" // Comment5
 *     | "thing2" // Comment6
 *   ) | Bar;
 *
 * @param {CommentContext} context
 * @returns {boolean}
 */
function handleLastUnionElementInExpression({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    isUnionType(precedingNode) &&
    ((isArrayType(enclosingNode) && !followingNode) ||
      isIntersectionType(enclosingNode) ||
      isUnionType(enclosingNode))
  ) {
    addTrailingComment(precedingNode.types.at(-1), comment);
    return true;
  }
  return false;
}

/**
 * const [
 *   foo,
 *   // bar
 *   // baz
 * ]: Foo = foo();
 *
 * const {
 *   foo,
 *   // bar
 *   // baz
 * }: Foo = foo();
 *
 */
function handleCommentsInDestructuringPattern({
  comment,
  enclosingNode,
  precedingNode,
  followingNode,
}) {
  if (
    (enclosingNode?.type === "ObjectPattern" ||
      enclosingNode?.type === "ArrayPattern") &&
    followingNode?.type === "TSTypeAnnotation"
  ) {
    if (precedingNode) {
      addTrailingComment(precedingNode, comment);
    } else {
      // const {
      //   // bar
      //   // baz
      // }: Foo = expr;
      addDanglingComment(enclosingNode, comment);
    }
    return true;
  }
}

function handleLastBinaryOperatorOperand({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  // "baz" should be a trailing comment of `cond3`:
  //
  //   !(
  //     cond1 || // foo
  //     cond2 || // bar
  //     cond3 // baz
  //   );
  if (
    !followingNode &&
    enclosingNode?.type === "UnaryExpression" &&
    (precedingNode?.type === "LogicalExpression" ||
      precedingNode?.type === "BinaryExpression")
  ) {
    //   !(
    //     (cond1 || cond2) // foo
    //   );
    // eslint-disable-next-line unicorn/no-lonely-if
    if (
      // Multiline expression
      hasNewlineInRange(
        text,
        locStart(enclosingNode.argument),
        locStart(precedingNode.right),
      ) &&
      isSingleLineComment(comment, text) &&
      // Comment and `precedingNode.right` are on same line
      !hasNewlineInRange(text, locStart(precedingNode.right), locStart(comment))
    ) {
      addTrailingComment(precedingNode.right, comment);
      return true;
    }
  }
  return false;
}

function handlePropertySignatureComments({
  enclosingNode,
  followingNode,
  comment,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "TSPropertySignature" ||
      enclosingNode.type === "ObjectTypeProperty") &&
    (isUnionType(followingNode) || isIntersectionType(followingNode))
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
}

function handleBinaryCastExpressionComment({
  enclosingNode,
  precedingNode,
  followingNode,
  comment,
  text,
}) {
  // Avoid break before `as` and `satisfies`
  if (
    isBinaryCastExpression(enclosingNode) &&
    precedingNode === enclosingNode.expression &&
    !isSingleLineComment(comment, text)
  ) {
    if (followingNode) {
      addLeadingComment(followingNode, comment);
    } else {
      addTrailingComment(enclosingNode, comment);
    }
    return true;
  }
}

/**
@param {Comment} comment
@param {NodeMap["ArrowFunctionExpression"]} arrowFunctionExpression
*/
function isCommentBeforeArrowFunctionExpressionArrow(
  comment,
  arrowFunctionExpression,
  options,
) {
  const arrowTokenIndex = stripComments(options).lastIndexOf(
    "=>",
    locStart(arrowFunctionExpression.body),
  );

  return locEnd(comment) < arrowTokenIndex;
}

/**
Avoid attaching multiline comment to node before arrow

```ts
const test = (): any => /* first line
second line
*\/
null;
```

@param {CommentContext} context
@returns {boolean}
*/
function handleArrowExpressionComments({
  comment,
  enclosingNode,
  followingNode,
  precedingNode,
  options,
}) {
  if (
    enclosingNode?.type !== "ArrowFunctionExpression" ||
    !followingNode ||
    !precedingNode
  ) {
    return false;
  }

  const isBeforeArrow = isCommentBeforeArrowFunctionExpressionArrow(
    comment,
    enclosingNode,
    options,
  );

  if (!isBeforeArrow) {
    addBlockOrNotComment(followingNode, comment);
    return true;
  }

  return false;
}

const isRealFunctionLikeNode = createTypeCheckFunction([
  "ArrowFunctionExpression",
  "FunctionExpression",
  "FunctionDeclaration",
  "ObjectMethod",
  "ClassMethod",
  "TSDeclareFunction",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSMethodSignature",
  "TSConstructorType",
  "TSFunctionType",
  "TSDeclareMethod",
  "HookDeclaration",
]);

const handleComments = {
  endOfLine: handleEndOfLineComment,
  ownLine: handleOwnLineComment,
  remaining: handleRemainingComment,
};

export default handleComments;
