"use strict";

const {
  getLast,
  hasNewline,
  getNextNonSpaceNonCommentCharacterIndexWithStartIndex,
  getNextNonSpaceNonCommentCharacter,
  hasNewlineInRange,
  getNextNonSpaceNonCommentCharacterIndex,
} = require("../common/util");
const {
  isBlockComment,
  getFunctionParameters,
  isPrettierIgnoreComment,
  isJSXNode,
  hasFlowShorthandAnnotationComment,
  hasFlowAnnotationComment,
  hasIgnoreComment,
} = require("./utils");
const { locStart, locEnd } = require("./loc");

/**
 * @typedef {import("./types/estree").Node} Node
 * @typedef {import("./types/estree").Comment} Comment
 * @typedef {import("../common/fast-path")} FastPath
 *
 * @typedef {Object} CommentContext
 * @property {Comment} comment
 * @property {Node} precedingNode
 * @property {Node} enclosingNode
 * @property {Node} followingNode
 * @property {string} text
 * @property {any} options
 * @property {Node} ast
 * @property {boolean} isLastComment
 *
 * @typedef {{node: any; type: string}} CommentHandleResult
 */

/**
 * @param {CommentContext} context
 * @returns {CommentHandleResult | void}
 */
function handleOwnLineComment(context) {
  for (const handler of [
    handleIgnoreComments,
    handleLastFunctionArgComments,
    handleMemberExpressionComments,
    handleIfStatementComments,
    handleWhileComments,
    handleTryStatementComments,
    handleClassComments,
    handleImportSpecifierComments,
    handleForComments,
    handleUnionTypeComments,
    handleOnlyComments,
    handleImportDeclarationComments,
    handleAssignmentPatternComments,
    handleMethodNameComments,
    handleLabeledStatementComments,
  ]) {
    const result = handler(context);
    if (typeof result !== "undefined") {
      return result;
    }
  }
}

/**
 * @param {CommentContext} context
 * @returns {CommentHandleResult | void}
 */
function handleEndOfLineComment(context) {
  for (const handler of [
    handleClosureTypeCastComments,
    handleLastFunctionArgComments,
    handleConditionalExpressionComments,
    handleImportSpecifierComments,
    handleIfStatementComments,
    handleWhileComments,
    handleTryStatementComments,
    handleClassComments,
    handleLabeledStatementComments,
    handleCallExpressionComments,
    handlePropertyComments,
    handleOnlyComments,
    handleTypeAliasComments,
    handleVariableDeclaratorComments,
  ]) {
    const result = handler(context);
    if (typeof result !== "undefined") {
      return result;
    }
  }
}

/**
 * @param {CommentContext} context
 * @returns {CommentHandleResult | void}
 */
function handleRemainingComment(context) {
  for (const handler of [
    handleIgnoreComments,
    handleIfStatementComments,
    handleWhileComments,
    handleObjectPropertyAssignment,
    handleCommentInEmptyParens,
    handleMethodNameComments,
    handleOnlyComments,
    handleCommentAfterArrowParams,
    handleFunctionNameComments,
    handleTSMappedTypeComments,
    handleBreakAndContinueStatementComments,
    handleTSFunctionTrailingComments,
  ]) {
    const result = handler(context);
    if (typeof result !== "undefined") {
      return result;
    }
  }
}

/**
 * @param {Node} node
 * @returns {CommentHandleResult}
 */
function addBlockStatementFirstComment(node) {
  // @ts-ignore
  const firstNonEmptyNode = (node.body || node.properties).find(
    ({ type }) => type !== "EmptyStatement"
  );
  if (firstNonEmptyNode) {
    return { node: firstNonEmptyNode, type: "leading" };
  }
  return { node, type: "dangling" };
}

/**
 * @param {Node} node
 * @returns {CommentHandleResult}
 */
function addBlockOrNotComment(node) {
  if (node.type === "BlockStatement") {
    return addBlockStatementFirstComment(node);
  }
  return { node, type: "leading" };
}

function handleClosureTypeCastComments({ comment, followingNode }) {
  if (followingNode && isTypeCastComment(comment)) {
    return { node: followingNode, type: "leading" };
  }
}

// There are often comments before the else clause of if statements like
//
//   if (1) { ... }
//   // comment
//   else { ... }
//
// They are being attached as leading comments of the BlockExpression which
// is not well printed. What we want is to instead move the comment inside
// of the block and make it leadingComment of the first element of the block
// or dangling comment of the block if there is nothing inside
//
//   if (1) { ... }
//   else {
//     // comment
//     ...
//   }
function handleIfStatementComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "IfStatement" ||
    !followingNode
  ) {
    return;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   if (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    locEnd
  );
  if (nextCharacter === ")") {
    return { node: precedingNode, type: "trailing" };
  }

  // Comments before `else`:
  // - treat as trailing comments of the consequent, if it's a BlockStatement
  // - treat as a dangling comment otherwise
  if (
    precedingNode === enclosingNode.consequent &&
    followingNode === enclosingNode.alternate
  ) {
    if (precedingNode.type === "BlockStatement") {
      return { node: precedingNode, type: "trailing" };
    }
    return { node: enclosingNode, type: "dangling" };
  }

  if (followingNode.type === "BlockStatement") {
    return addBlockStatementFirstComment(followingNode);
  }

  if (followingNode.type === "IfStatement") {
    return addBlockOrNotComment(followingNode.consequent);
  }

  // For comments positioned after the condition parenthesis in an if statement
  // before the consequent without brackets on, such as
  // if (a) /* comment */ true,
  // we look at the next character to see if the following node
  // is the consequent for the if statement
  if (enclosingNode.consequent === followingNode) {
    return { node: followingNode, type: "leading" };
  }
}

function handleWhileComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "WhileStatement" ||
    !followingNode
  ) {
    return;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   while (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(
    text,
    comment,
    locEnd
  );
  if (nextCharacter === ")") {
    return { node: precedingNode, type: "trailing" };
  }

  if (followingNode.type === "BlockStatement") {
    return addBlockStatementFirstComment(followingNode);
  }

  if (enclosingNode.body === followingNode) {
    return { node: followingNode, type: "leading" };
  }
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments({
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    !enclosingNode ||
    (enclosingNode.type !== "TryStatement" &&
      enclosingNode.type !== "CatchClause") ||
    !followingNode
  ) {
    return;
  }

  if (enclosingNode.type === "CatchClause" && precedingNode) {
    return { node: precedingNode, type: "trailing" };
  }

  if (followingNode.type === "BlockStatement") {
    return addBlockStatementFirstComment(followingNode);
  }

  if (followingNode.type === "TryStatement") {
    return addBlockOrNotComment(followingNode.finalizer);
  }

  if (followingNode.type === "CatchClause") {
    return addBlockOrNotComment(followingNode.body);
  }
}

function handleMemberExpressionComments({ enclosingNode, followingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "MemberExpression" ||
      enclosingNode.type === "OptionalMemberExpression") &&
    followingNode &&
    followingNode.type === "Identifier"
  ) {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleConditionalExpressionComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  const isSameLineAsPrecedingNode =
    precedingNode &&
    !hasNewlineInRange(text, locEnd(precedingNode), locStart(comment));

  if (
    (!precedingNode || !isSameLineAsPrecedingNode) &&
    enclosingNode &&
    (enclosingNode.type === "ConditionalExpression" ||
      enclosingNode.type === "TSConditionalType") &&
    followingNode
  ) {
    return { node: followingNode, type: "leading" };
  }
}

function handleObjectPropertyAssignment({ precedingNode, enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ObjectProperty" ||
      enclosingNode.type === "Property") &&
    enclosingNode.shorthand &&
    enclosingNode.key === precedingNode &&
    enclosingNode.value.type === "AssignmentPattern"
  ) {
    return { node: enclosingNode.value.left, type: "trailing" };
  }
}

function handleClassComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ClassDeclaration" ||
      enclosingNode.type === "ClassExpression" ||
      enclosingNode.type === "DeclareClass" ||
      enclosingNode.type === "DeclareInterface" ||
      enclosingNode.type === "InterfaceDeclaration" ||
      enclosingNode.type === "TSInterfaceDeclaration")
  ) {
    if (
      enclosingNode.decorators &&
      enclosingNode.decorators.length > 0 &&
      !(followingNode && followingNode.type === "Decorator")
    ) {
      return {
        node: enclosingNode.decorators[enclosingNode.decorators.length - 1],
        type: "trailing",
      };
    }

    if (enclosingNode.body && followingNode === enclosingNode.body) {
      return addBlockStatementFirstComment(enclosingNode.body);
    }

    // Don't add leading comments to `implements`, `extends`, `mixins` to
    // avoid printing the comment after the keyword.
    if (followingNode) {
      for (const prop of ["implements", "extends", "mixins"]) {
        if (enclosingNode[prop] && followingNode === enclosingNode[prop][0]) {
          if (
            precedingNode &&
            (precedingNode === enclosingNode.id ||
              precedingNode === enclosingNode.typeParameters ||
              precedingNode === enclosingNode.superClass)
          ) {
            return { node: precedingNode, type: "trailing" };
          }
          comment.marker = prop;
          return { node: enclosingNode, comment, type: "dangling" };
        }
      }
    }
  }
}

function handleMethodNameComments({ precedingNode, enclosingNode, text }) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (
    enclosingNode &&
    precedingNode &&
    // "MethodDefinition" is handled in getCommentChildNodes
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "TSDeclareMethod" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    precedingNode.type === "Identifier" &&
    enclosingNode.key === precedingNode &&
    // special Property case: { key: /*comment*/(value) };
    // comment should be attached to value instead of key
    getNextNonSpaceNonCommentCharacter(text, precedingNode, locEnd) !== ":"
  ) {
    return { node: precedingNode, type: "trailing" };
  }

  // Print comments between decorators and class methods as a trailing comment
  // on the decorator node instead of the method node
  if (
    precedingNode &&
    enclosingNode &&
    precedingNode.type === "Decorator" &&
    (enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "ClassProperty" ||
      enclosingNode.type === "FieldDefinition" ||
      enclosingNode.type === "TSAbstractClassProperty" ||
      enclosingNode.type === "TSAbstractMethodDefinition" ||
      enclosingNode.type === "TSDeclareMethod" ||
      enclosingNode.type === "MethodDefinition")
  ) {
    return { node: precedingNode, type: "trailing" };
  }
}

function handleFunctionNameComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (getNextNonSpaceNonCommentCharacter(text, comment, locEnd) !== "(") {
    return;
  }
  if (
    precedingNode &&
    enclosingNode &&
    (enclosingNode.type === "FunctionDeclaration" ||
      enclosingNode.type === "FunctionExpression" ||
      enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "MethodDefinition" ||
      enclosingNode.type === "ObjectMethod")
  ) {
    return { node: precedingNode, type: "trailing" };
  }
}

function handleCommentAfterArrowParams({ comment, enclosingNode, text }) {
  if (!(enclosingNode && enclosingNode.type === "ArrowFunctionExpression")) {
    return;
  }

  const index = getNextNonSpaceNonCommentCharacterIndex(text, comment, locEnd);
  if (index !== false && text.slice(index, index + 2) === "=>") {
    return { node: enclosingNode, type: "dangling" };
  }
}

function handleCommentInEmptyParens({ comment, enclosingNode, text }) {
  if (getNextNonSpaceNonCommentCharacter(text, comment, locEnd) !== ")") {
    return;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.
  if (
    enclosingNode &&
    ((isRealFunctionLikeNode(enclosingNode) &&
      getFunctionParameters(enclosingNode).length === 0) ||
      ((enclosingNode.type === "CallExpression" ||
        enclosingNode.type === "OptionalCallExpression" ||
        enclosingNode.type === "NewExpression") &&
        enclosingNode.arguments.length === 0))
  ) {
    return { node: enclosingNode, type: "dangling" };
  }
  if (
    enclosingNode &&
    enclosingNode.type === "MethodDefinition" &&
    getFunctionParameters(enclosingNode.value).length === 0
  ) {
    return { node: enclosingNode.value, type: "dangling" };
  }
}

function handleLastFunctionArgComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
  text,
}) {
  // Flow function type definitions
  if (
    precedingNode &&
    precedingNode.type === "FunctionTypeParam" &&
    enclosingNode &&
    enclosingNode.type === "FunctionTypeAnnotation" &&
    followingNode &&
    followingNode.type !== "FunctionTypeParam"
  ) {
    return { node: precedingNode, type: "trailing" };
  }

  // Real functions and TypeScript function type definitions
  if (
    precedingNode &&
    (precedingNode.type === "Identifier" ||
      precedingNode.type === "AssignmentPattern") &&
    enclosingNode &&
    isRealFunctionLikeNode(enclosingNode) &&
    getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === ")"
  ) {
    return { node: precedingNode, type: "trailing" };
  }

  if (
    enclosingNode &&
    enclosingNode.type === "FunctionDeclaration" &&
    followingNode &&
    followingNode.type === "BlockStatement"
  ) {
    const functionParamRightParenIndex = (() => {
      const parameters = getFunctionParameters(enclosingNode);
      if (parameters.length !== 0) {
        return getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
          text,
          locEnd(getLast(parameters))
        );
      }
      const functionParamLeftParenIndex = getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
        text,
        locEnd(enclosingNode.id)
      );
      return (
        functionParamLeftParenIndex !== false &&
        getNextNonSpaceNonCommentCharacterIndexWithStartIndex(
          text,
          functionParamLeftParenIndex + 1
        )
      );
    })();
    if (locStart(comment) > functionParamRightParenIndex) {
      return addBlockStatementFirstComment(followingNode);
    }
  }
}

function handleImportSpecifierComments({ enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleLabeledStatementComments({ enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleBreakAndContinueStatementComments({ enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ContinueStatement" ||
      enclosingNode.type === "BreakStatement") &&
    !enclosingNode.label
  ) {
    return { node: enclosingNode, type: "trailing" };
  }
}

function handleCallExpressionComments({ precedingNode, enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "CallExpression" ||
      enclosingNode.type === "OptionalCallExpression") &&
    precedingNode &&
    enclosingNode.callee === precedingNode &&
    enclosingNode.arguments.length > 0
  ) {
    return { node: enclosingNode.arguments[0], type: "leading" };
  }
}

function handleUnionTypeComments({
  comment,
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "UnionTypeAnnotation" ||
      enclosingNode.type === "TSUnionType")
  ) {
    if (isPrettierIgnoreComment(comment)) {
      followingNode.prettierIgnore = true;
      comment.unignore = true;
    }
    if (precedingNode) {
      return { node: precedingNode, type: "trailing" };
    }
    return;
  }

  if (
    followingNode &&
    (followingNode.type === "UnionTypeAnnotation" ||
      followingNode.type === "TSUnionType") &&
    isPrettierIgnoreComment(comment)
  ) {
    followingNode.types[0].prettierIgnore = true;
    comment.unignore = true;
  }
}

function handlePropertyComments({ enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "ObjectProperty")
  ) {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleOnlyComments({ enclosingNode, ast, isLastComment }) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast && ast.body && ast.body.length === 0) {
    if (isLastComment) {
      return { node: ast, type: "dangling" };
    }
    return { node: ast, type: "leading" };
  } else if (
    enclosingNode &&
    enclosingNode.type === "Program" &&
    enclosingNode.body.length === 0 &&
    enclosingNode.directives &&
    enclosingNode.directives.length === 0
  ) {
    if (isLastComment) {
      return { node: enclosingNode, type: "dangling" };
    }
    return { node: enclosingNode, type: "leading" };
  }
}

function handleForComments({ enclosingNode }) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ForInStatement" ||
      enclosingNode.type === "ForOfStatement")
  ) {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleImportDeclarationComments({
  comment,
  precedingNode,
  enclosingNode,
  text,
}) {
  if (
    precedingNode &&
    precedingNode.type === "ImportSpecifier" &&
    enclosingNode &&
    enclosingNode.type === "ImportDeclaration" &&
    hasNewline(text, locEnd(comment))
  ) {
    return { node: precedingNode, type: "trailing" };
  }
}

function handleAssignmentPatternComments({ enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleTypeAliasComments({ enclosingNode }) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    return { node: enclosingNode, type: "leading" };
  }
}

function handleVariableDeclaratorComments({
  comment,
  enclosingNode,
  followingNode,
}) {
  if (
    enclosingNode &&
    (enclosingNode.type === "VariableDeclarator" ||
      enclosingNode.type === "AssignmentExpression") &&
    followingNode &&
    (followingNode.type === "ObjectExpression" ||
      followingNode.type === "ArrayExpression" ||
      followingNode.type === "TemplateLiteral" ||
      followingNode.type === "TaggedTemplateExpression" ||
      isBlockComment(comment))
  ) {
    return { node: followingNode, type: "leading" };
  }
}

function handleTSFunctionTrailingComments({
  comment,
  enclosingNode,
  followingNode,
  text,
}) {
  if (
    !followingNode &&
    enclosingNode &&
    (enclosingNode.type === "TSMethodSignature" ||
      enclosingNode.type === "TSDeclareFunction" ||
      enclosingNode.type === "TSAbstractMethodDefinition") &&
    getNextNonSpaceNonCommentCharacter(text, comment, locEnd) === ";"
  ) {
    return { node: enclosingNode, type: "trailing" };
  }
}

function handleIgnoreComments({ comment, enclosingNode, followingNode }) {
  if (
    isPrettierIgnoreComment(comment) &&
    enclosingNode &&
    enclosingNode.type === "TSMappedType" &&
    followingNode &&
    followingNode.type === "TSTypeParameter" &&
    followingNode.constraint
  ) {
    enclosingNode.prettierIgnore = true;
    comment.unignore = true;
  }
}

function handleTSMappedTypeComments({
  precedingNode,
  enclosingNode,
  followingNode,
}) {
  if (!enclosingNode || enclosingNode.type !== "TSMappedType") {
    return;
  }

  if (
    followingNode &&
    followingNode.type === "TSTypeParameter" &&
    followingNode.name
  ) {
    return { node: followingNode.name, type: "leading" };
  }

  if (
    precedingNode &&
    precedingNode.type === "TSTypeParameter" &&
    precedingNode.constraint
  ) {
    return { node: precedingNode.constraint, type: "trailing" };
  }
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isRealFunctionLikeNode(node) {
  return (
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression" ||
    node.type === "FunctionDeclaration" ||
    node.type === "ObjectMethod" ||
    node.type === "ClassMethod" ||
    node.type === "TSDeclareFunction" ||
    node.type === "TSCallSignatureDeclaration" ||
    node.type === "TSConstructSignatureDeclaration" ||
    node.type === "TSMethodSignature" ||
    node.type === "TSConstructorType" ||
    node.type === "TSFunctionType" ||
    node.type === "TSDeclareMethod"
  );
}

/**
 * @param {Node} enclosingNode
 * @returns {RegExp | void}
 */
function getGapRegex(enclosingNode) {
  if (
    enclosingNode &&
    enclosingNode.type !== "BinaryExpression" &&
    enclosingNode.type !== "LogicalExpression"
  ) {
    // Support degenerate single-element unions and intersections.
    // E.g.: `type A = /* 1 */ & B`
    return /^[\s&(|]*$/;
  }
}

/**
 * @param {any} node
 * @returns {Node[] | void}
 */
function getCommentChildNodes(node, options) {
  // Prevent attaching comments to FunctionExpression in this case:
  //     class Foo {
  //       bar() // comment
  //       {
  //         baz();
  //       }
  //     }
  if (
    (options.parser === "typescript" ||
      options.parser === "flow" ||
      options.parser === "espree" ||
      options.parser === "meriyah") &&
    node.type === "MethodDefinition" &&
    node.value &&
    node.value.type === "FunctionExpression" &&
    getFunctionParameters(node.value).length === 0 &&
    !node.value.returnType &&
    (!node.value.typeParameters || node.value.typeParameters.length === 0) &&
    node.value.body
  ) {
    return [...(node.decorators || []), node.key, node.value.body];
  }
}

/**
 * @param {Comment} comment
 * @returns {boolean}
 */
function isTypeCastComment(comment) {
  return (
    isBlockComment(comment) &&
    comment.value[0] === "*" &&
    // TypeScript expects the type to be enclosed in curly brackets, however
    // Closure Compiler accepts types in parens and even without any delimiters at all.
    // That's why we just search for "@type".
    /@type\b/.test(comment.value)
  );
}

/**
 * @param {FastPath} path
 * @returns {boolean}
 */
function willPrintOwnComments(path, options) {
  const node = path.getValue();
  const parent = path.getParentNode();

  return (
    ((node &&
      (isJSXNode(node) ||
        hasFlowShorthandAnnotationComment(node) ||
        (parent &&
          (parent.type === "CallExpression" ||
            parent.type === "OptionalCallExpression") &&
          (hasFlowAnnotationComment(node.leadingComments) ||
            hasFlowAnnotationComment(node.trailingComments))))) ||
      (parent &&
        (parent.type === "JSXSpreadAttribute" ||
          parent.type === "JSXSpreadChild" ||
          parent.type === "UnionTypeAnnotation" ||
          parent.type === "TSUnionType" ||
          ((parent.type === "ClassDeclaration" ||
            parent.type === "ClassExpression") &&
            parent.superClass === node)))) &&
    (!hasIgnoreComment(path, options) ||
      parent.type === "UnionTypeAnnotation" ||
      parent.type === "TSUnionType")
  );
}

module.exports = {
  handleOwnLineComment,
  handleEndOfLineComment,
  handleRemainingComment,
  isTypeCastComment,
  getGapRegex,
  getCommentChildNodes,
  willPrintOwnComments,
};
