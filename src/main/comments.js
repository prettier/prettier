"use strict";

const assert = require("assert");
const docBuilders = require("../doc").builders;
const concat = docBuilders.concat;
const hardline = docBuilders.hardline;
const breakParent = docBuilders.breakParent;
const indent = docBuilders.indent;
const lineSuffix = docBuilders.lineSuffix;
const join = docBuilders.join;
const cursor = docBuilders.cursor;
const util = require("../common/util");
const childNodesCacheKey = Symbol("child-nodes");
const locStart = util.locStart;
const locEnd = util.locEnd;
const getNextNonSpaceNonCommentCharacter =
  util.getNextNonSpaceNonCommentCharacter;
const getNextNonSpaceNonCommentCharacterIndex =
  util.getNextNonSpaceNonCommentCharacterIndex;

function getSortedChildNodes(node, text, options, resultArray) {
  if (!node) {
    return;
  }
  const printer = options.printer;

  if (resultArray) {
    if (node && printer.canAttachComment && printer.canAttachComment(node)) {
      // This reverse insertion sort almost always takes constant
      // time because we almost always (maybe always?) append the
      // nodes in order anyway.
      let i;
      for (i = resultArray.length - 1; i >= 0; --i) {
        if (
          locStart(resultArray[i]) <= locStart(node) &&
          locEnd(resultArray[i]) <= locEnd(node)
        ) {
          break;
        }
      }
      resultArray.splice(i + 1, 0, node);
      return;
    }
  } else if (node[childNodesCacheKey]) {
    return node[childNodesCacheKey];
  }

  let childNodes;

  if (printer.getCommentChildNodes) {
    childNodes = printer.getCommentChildNodes(node);
  } else if (node && typeof node === "object") {
    childNodes = Object.keys(node)
      .filter(
        n =>
          n !== "enclosingNode" &&
          n !== "precedingNode" &&
          n !== "followingNode"
      )
      .map(n => node[n]);
  }

  if (!childNodes) {
    return;
  }

  if (!resultArray) {
    Object.defineProperty(node, childNodesCacheKey, {
      value: (resultArray = []),
      enumerable: false
    });
  }

  childNodes.forEach(childNode => {
    getSortedChildNodes(childNode, text, options, resultArray);
  });

  return resultArray;
}

// As efficiently as possible, decorate the comment object with
// .precedingNode, .enclosingNode, and/or .followingNode properties, at
// least one of which is guaranteed to be defined.
function decorateComment(node, comment, text, options) {
  const childNodes = getSortedChildNodes(node, text, options);
  let precedingNode;
  let followingNode;
  // Time to dust off the old binary search robes and wizard hat.
  let left = 0;
  let right = childNodes.length;
  while (left < right) {
    const middle = (left + right) >> 1;
    const child = childNodes[middle];

    if (
      locStart(child) - locStart(comment) <= 0 &&
      locEnd(comment) - locEnd(child) <= 0
    ) {
      // The comment is completely contained by this child node.
      comment.enclosingNode = child;

      decorateComment(child, comment, text, options);
      return; // Abandon the binary search at this level.
    }

    if (locEnd(child) - locStart(comment) <= 0) {
      // This child node falls completely before the comment.
      // Because we will never consider this node or any nodes
      // before it again, this node must be the closest preceding
      // node we have encountered so far.
      precedingNode = child;
      left = middle + 1;
      continue;
    }

    if (locEnd(comment) - locStart(child) <= 0) {
      // This child node falls completely after the comment.
      // Because we will never consider this node or any nodes after
      // it again, this node must be the closest following node we
      // have encountered so far.
      followingNode = child;
      right = middle;
      continue;
    }

    /* istanbul ignore next */
    throw new Error("Comment location overlaps with node location");
  }

  // We don't want comments inside of different expressions inside of the same
  // template literal to move to another expression.
  if (
    comment.enclosingNode &&
    comment.enclosingNode.type === "TemplateLiteral"
  ) {
    const quasis = comment.enclosingNode.quasis;
    const commentIndex = findExpressionIndexForComment(quasis, comment);

    if (
      precedingNode &&
      findExpressionIndexForComment(quasis, precedingNode) !== commentIndex
    ) {
      precedingNode = null;
    }
    if (
      followingNode &&
      findExpressionIndexForComment(quasis, followingNode) !== commentIndex
    ) {
      followingNode = null;
    }
  }

  if (precedingNode) {
    comment.precedingNode = precedingNode;
  }

  if (followingNode) {
    comment.followingNode = followingNode;
  }
}

function attach(comments, ast, text, options) {
  if (!Array.isArray(comments)) {
    return;
  }

  const tiesToBreak = [];

  comments.forEach((comment, i) => {
    if (options.parser === "json" && locStart(comment) - locStart(ast) <= 0) {
      addLeadingComment(ast, comment);
      return;
    }

    decorateComment(ast, comment, text, options);

    const precedingNode = comment.precedingNode;
    const enclosingNode = comment.enclosingNode;
    const followingNode = comment.followingNode;

    const isLastComment = comments.length - 1 === i;

    if (util.hasNewline(text, locStart(comment), { backwards: true })) {
      // If a comment exists on its own line, prefer a leading comment.
      // We also need to check if it's the first line of the file.
      if (
        handleLastFunctionArgComments(
          text,
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleMemberExpressionComments(enclosingNode, followingNode, comment) ||
        handleIfStatementComments(
          text,
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleTryStatementComments(enclosingNode, followingNode, comment) ||
        handleClassComments(
          enclosingNode,
          precedingNode,
          followingNode,
          comment
        ) ||
        handleImportSpecifierComments(enclosingNode, comment) ||
        handleForComments(enclosingNode, precedingNode, comment) ||
        handleUnionTypeComments(
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
        handleImportDeclarationComments(
          text,
          enclosingNode,
          precedingNode,
          comment
        ) ||
        handleAssignmentPatternComments(enclosingNode, comment) ||
        handleMethodNameComments(text, enclosingNode, precedingNode, comment)
      ) {
        // We're good
      } else if (followingNode) {
        // Always a leading comment.
        addLeadingComment(followingNode, comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else if (util.hasNewline(text, locEnd(comment))) {
      if (
        handleLastFunctionArgComments(
          text,
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleConditionalExpressionComments(
          enclosingNode,
          precedingNode,
          followingNode,
          comment,
          text
        ) ||
        handleImportSpecifierComments(enclosingNode, comment) ||
        handleIfStatementComments(
          text,
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleClassComments(
          enclosingNode,
          precedingNode,
          followingNode,
          comment
        ) ||
        handleLabeledStatementComments(enclosingNode, comment) ||
        handleCallExpressionComments(precedingNode, enclosingNode, comment) ||
        handlePropertyComments(enclosingNode, comment) ||
        handleExportNamedDeclarationComments(enclosingNode, comment) ||
        handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
        handleTypeAliasComments(enclosingNode, followingNode, comment) ||
        handleVariableDeclaratorComments(enclosingNode, followingNode, comment)
      ) {
        // We're good
      } else if (precedingNode) {
        // There is content before this comment on the same line, but
        // none after it, so prefer a trailing comment of the previous node.
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    } else {
      if (
        handleIfStatementComments(
          text,
          precedingNode,
          enclosingNode,
          followingNode,
          comment
        ) ||
        handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) ||
        handleCommentInEmptyParens(text, enclosingNode, comment) ||
        handleMethodNameComments(text, enclosingNode, precedingNode, comment) ||
        handleOnlyComments(enclosingNode, ast, comment, isLastComment) ||
        handleCommentAfterArrowParams(text, enclosingNode, comment) ||
        handleFunctionNameComments(text, enclosingNode, precedingNode, comment)
      ) {
        // We're good
      } else if (precedingNode && followingNode) {
        // Otherwise, text exists both before and after the comment on
        // the same line. If there is both a preceding and following
        // node, use a tie-breaking algorithm to determine if it should
        // be attached to the next or previous node. In the last case,
        // simply attach the right node;
        const tieCount = tiesToBreak.length;
        if (tieCount > 0) {
          const lastTie = tiesToBreak[tieCount - 1];
          if (lastTie.followingNode !== comment.followingNode) {
            breakTies(tiesToBreak, text);
          }
        }
        tiesToBreak.push(comment);
      } else if (precedingNode) {
        addTrailingComment(precedingNode, comment);
      } else if (followingNode) {
        addLeadingComment(followingNode, comment);
      } else if (enclosingNode) {
        addDanglingComment(enclosingNode, comment);
      } else {
        // There are no nodes, let's attach it to the root of the ast
        /* istanbul ignore next */
        addDanglingComment(ast, comment);
      }
    }
  });

  breakTies(tiesToBreak, text);

  comments.forEach(comment => {
    // These node references were useful for breaking ties, but we
    // don't need them anymore, and they create cycles in the AST that
    // may lead to infinite recursion if we don't delete them here.
    delete comment.precedingNode;
    delete comment.enclosingNode;
    delete comment.followingNode;
  });
}

function breakTies(tiesToBreak, text) {
  const tieCount = tiesToBreak.length;
  if (tieCount === 0) {
    return;
  }

  const precedingNode = tiesToBreak[0].precedingNode;
  const followingNode = tiesToBreak[0].followingNode;
  let gapEndPos = locStart(followingNode);

  // Iterate backwards through tiesToBreak, examining the gaps
  // between the tied comments. In order to qualify as leading, a
  // comment must be separated from followingNode by an unbroken series of
  // gaps (or other comments). Gaps should only contain whitespace or open
  // parentheses.
  let indexOfFirstLeadingComment;
  for (
    indexOfFirstLeadingComment = tieCount;
    indexOfFirstLeadingComment > 0;
    --indexOfFirstLeadingComment
  ) {
    const comment = tiesToBreak[indexOfFirstLeadingComment - 1];
    assert.strictEqual(comment.precedingNode, precedingNode);
    assert.strictEqual(comment.followingNode, followingNode);

    const gap = text.slice(locEnd(comment), gapEndPos).trim();
    if (gap === "" || /^\(+$/.test(gap)) {
      gapEndPos = locStart(comment);
    } else {
      // The gap string contained something other than whitespace or open
      // parentheses.
      break;
    }
  }

  tiesToBreak.forEach((comment, i) => {
    if (i < indexOfFirstLeadingComment) {
      addTrailingComment(precedingNode, comment);
    } else {
      addLeadingComment(followingNode, comment);
    }
  });

  tiesToBreak.length = 0;
}

function addCommentHelper(node, comment) {
  const comments = node.comments || (node.comments = []);
  comments.push(comment);
  comment.printed = false;

  // For some reason, TypeScript parses `// x` inside of JSXText as a comment
  // We already "print" it via the raw text, we don't need to re-print it as a
  // comment
  if (node.type === "JSXText") {
    comment.printed = true;
  }
}

function addLeadingComment(node, comment) {
  comment.leading = true;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addDanglingComment(node, comment) {
  comment.leading = false;
  comment.trailing = false;
  addCommentHelper(node, comment);
}

function addTrailingComment(node, comment) {
  comment.leading = false;
  comment.trailing = true;
  addCommentHelper(node, comment);
}

function addBlockStatementFirstComment(node, comment) {
  const body = node.body.filter(n => n.type !== "EmptyStatement");
  if (body.length === 0) {
    addDanglingComment(node, comment);
  } else {
    addLeadingComment(body[0], comment);
  }
}

function addBlockOrNotComment(node, comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
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
function handleIfStatementComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment
) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "IfStatement" ||
    !followingNode
  ) {
    return false;
  }

  // We unfortunately have no way using the AST or location of nodes to know
  // if the comment is positioned before the condition parenthesis:
  //   if (a /* comment */) {}
  // The only workaround I found is to look at the next character to see if
  // it is a ).
  const nextCharacter = getNextNonSpaceNonCommentCharacter(text, comment);
  if (nextCharacter === ")") {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  if (followingNode.type === "BlockStatement") {
    addBlockStatementFirstComment(followingNode, comment);
    return true;
  }

  if (followingNode.type === "IfStatement") {
    addBlockOrNotComment(followingNode.consequent, comment);
    return true;
  }

  // For comments positioned after the condition parenthesis in an if statement
  // before the consequent with or without brackets on, such as
  // if (a) /* comment */ {} or if (a) /* comment */ true,
  // we look at the next character to see if it is a { or if the following node
  // is the consequent for the if statement
  if (nextCharacter === "{" || enclosingNode.consequent === followingNode) {
    addLeadingComment(followingNode, comment);
    return true;
  }

  return false;
}

// Same as IfStatement but for TryStatement
function handleTryStatementComments(enclosingNode, followingNode, comment) {
  if (
    !enclosingNode ||
    enclosingNode.type !== "TryStatement" ||
    !followingNode
  ) {
    return false;
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

function handleMemberExpressionComments(enclosingNode, followingNode, comment) {
  if (
    enclosingNode &&
    enclosingNode.type === "MemberExpression" &&
    followingNode &&
    followingNode.type === "Identifier"
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleConditionalExpressionComments(
  enclosingNode,
  precedingNode,
  followingNode,
  comment,
  text
) {
  const isSameLineAsPrecedingNode =
    precedingNode &&
    !util.hasNewlineInRange(text, locEnd(precedingNode), locStart(comment));

  if (
    (!precedingNode || !isSameLineAsPrecedingNode) &&
    enclosingNode &&
    enclosingNode.type === "ConditionalExpression" &&
    followingNode
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function handleObjectPropertyAssignment(enclosingNode, precedingNode, comment) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ObjectProperty" ||
      enclosingNode.type === "Property") &&
    enclosingNode.shorthand &&
    enclosingNode.key === precedingNode &&
    enclosingNode.value.type === "AssignmentPattern"
  ) {
    addTrailingComment(enclosingNode.value.left, comment);
    return true;
  }
  return false;
}

function handleClassComments(
  enclosingNode,
  precedingNode,
  followingNode,
  comment
) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ClassDeclaration" ||
      enclosingNode.type === "ClassExpression") &&
    (enclosingNode.decorators && enclosingNode.decorators.length > 0) &&
    !(followingNode && followingNode.type === "Decorator")
  ) {
    if (!enclosingNode.decorators || enclosingNode.decorators.length === 0) {
      addLeadingComment(enclosingNode, comment);
    } else {
      addTrailingComment(
        enclosingNode.decorators[enclosingNode.decorators.length - 1],
        comment
      );
    }
    return true;
  }
  return false;
}

function handleMethodNameComments(text, enclosingNode, precedingNode, comment) {
  // This is only needed for estree parsers (flow, typescript) to attach
  // after a method name:
  // obj = { fn /*comment*/() {} };
  if (
    enclosingNode &&
    precedingNode &&
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "MethodDefinition") &&
    precedingNode.type === "Identifier" &&
    enclosingNode.key === precedingNode &&
    // special Property case: { key: /*comment*/(value) };
    // comment should be attached to value instead of key
    getNextNonSpaceNonCommentCharacter(text, precedingNode) !== ":"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Print comments between decorators and class methods as a trailing comment
  // on the decorator node instead of the method node
  if (
    precedingNode &&
    enclosingNode &&
    precedingNode.type === "Decorator" &&
    (enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "ClassProperty" ||
      enclosingNode.type === "TSAbstractClassProperty" ||
      enclosingNode.type === "TSAbstractMethodDefinition" ||
      enclosingNode.type === "MethodDefinition")
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  return false;
}

function handleFunctionNameComments(
  text,
  enclosingNode,
  precedingNode,
  comment
) {
  if (getNextNonSpaceNonCommentCharacter(text, comment) !== "(") {
    return false;
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
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleCommentAfterArrowParams(text, enclosingNode, comment) {
  if (!(enclosingNode && enclosingNode.type === "ArrowFunctionExpression")) {
    return false;
  }

  const index = getNextNonSpaceNonCommentCharacterIndex(text, comment);
  if (text.substr(index, 2) === "=>") {
    addDanglingComment(enclosingNode, comment);
    return true;
  }

  return false;
}

function handleCommentInEmptyParens(text, enclosingNode, comment) {
  if (getNextNonSpaceNonCommentCharacter(text, comment) !== ")") {
    return false;
  }

  // Only add dangling comments to fix the case when no params are present,
  // i.e. a function without any argument.
  if (
    enclosingNode &&
    (((enclosingNode.type === "FunctionDeclaration" ||
      enclosingNode.type === "FunctionExpression" ||
      (enclosingNode.type === "ArrowFunctionExpression" &&
        (enclosingNode.body.type !== "CallExpression" ||
          enclosingNode.body.arguments.length === 0)) ||
      enclosingNode.type === "ClassMethod" ||
      enclosingNode.type === "ObjectMethod") &&
      enclosingNode.params.length === 0) ||
      (enclosingNode.type === "CallExpression" &&
        enclosingNode.arguments.length === 0))
  ) {
    addDanglingComment(enclosingNode, comment);
    return true;
  }
  if (
    enclosingNode &&
    (enclosingNode.type === "MethodDefinition" &&
      enclosingNode.value.params.length === 0)
  ) {
    addDanglingComment(enclosingNode.value, comment);
    return true;
  }
  return false;
}

function handleLastFunctionArgComments(
  text,
  precedingNode,
  enclosingNode,
  followingNode,
  comment
) {
  // Type definitions functions
  if (
    precedingNode &&
    precedingNode.type === "FunctionTypeParam" &&
    enclosingNode &&
    enclosingNode.type === "FunctionTypeAnnotation" &&
    followingNode &&
    followingNode.type !== "FunctionTypeParam"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }

  // Real functions
  if (
    precedingNode &&
    (precedingNode.type === "Identifier" ||
      precedingNode.type === "AssignmentPattern") &&
    enclosingNode &&
    (enclosingNode.type === "ArrowFunctionExpression" ||
      enclosingNode.type === "FunctionExpression" ||
      enclosingNode.type === "FunctionDeclaration" ||
      enclosingNode.type === "ObjectMethod" ||
      enclosingNode.type === "ClassMethod") &&
    getNextNonSpaceNonCommentCharacter(text, comment) === ")"
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleImportSpecifierComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ImportSpecifier") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleLabeledStatementComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "LabeledStatement") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleCallExpressionComments(precedingNode, enclosingNode, comment) {
  if (
    enclosingNode &&
    enclosingNode.type === "CallExpression" &&
    precedingNode &&
    enclosingNode.callee === precedingNode &&
    enclosingNode.arguments.length > 0
  ) {
    addLeadingComment(enclosingNode.arguments[0], comment);
    return true;
  }
  return false;
}

function handleUnionTypeComments(
  precedingNode,
  enclosingNode,
  followingNode,
  comment
) {
  if (
    enclosingNode &&
    (enclosingNode.type === "UnionTypeAnnotation" ||
      enclosingNode.type === "TSUnionType")
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handlePropertyComments(enclosingNode, comment) {
  if (
    enclosingNode &&
    (enclosingNode.type === "Property" ||
      enclosingNode.type === "ObjectProperty")
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleExportNamedDeclarationComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "ExportNamedDeclaration") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleOnlyComments(enclosingNode, ast, comment, isLastComment) {
  // With Flow the enclosingNode is undefined so use the AST instead.
  if (ast && ast.body && ast.body.length === 0) {
    if (isLastComment) {
      addDanglingComment(ast, comment);
    } else {
      addLeadingComment(ast, comment);
    }
    return true;
  } else if (
    enclosingNode &&
    enclosingNode.type === "Program" &&
    enclosingNode.body.length === 0 &&
    enclosingNode.directives &&
    enclosingNode.directives.length === 0
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

function handleForComments(enclosingNode, precedingNode, comment) {
  if (
    enclosingNode &&
    (enclosingNode.type === "ForInStatement" ||
      enclosingNode.type === "ForOfStatement")
  ) {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleImportDeclarationComments(
  text,
  enclosingNode,
  precedingNode,
  comment
) {
  if (
    precedingNode &&
    enclosingNode &&
    enclosingNode.type === "ImportDeclaration" &&
    util.hasNewline(text, util.locEnd(comment))
  ) {
    addTrailingComment(precedingNode, comment);
    return true;
  }
  return false;
}

function handleAssignmentPatternComments(enclosingNode, comment) {
  if (enclosingNode && enclosingNode.type === "AssignmentPattern") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleTypeAliasComments(enclosingNode, followingNode, comment) {
  if (enclosingNode && enclosingNode.type === "TypeAlias") {
    addLeadingComment(enclosingNode, comment);
    return true;
  }
  return false;
}

function handleVariableDeclaratorComments(
  enclosingNode,
  followingNode,
  comment
) {
  if (
    enclosingNode &&
    enclosingNode.type === "VariableDeclarator" &&
    followingNode &&
    (followingNode.type === "ObjectExpression" ||
      followingNode.type === "ArrayExpression")
  ) {
    addLeadingComment(followingNode, comment);
    return true;
  }
  return false;
}

function printComment(commentPath, options) {
  const comment = commentPath.getValue();
  comment.printed = true;
  return options.printer.printComment(commentPath, options);
}

function findExpressionIndexForComment(quasis, comment) {
  const startPos = locStart(comment) - 1;

  for (let i = 1; i < quasis.length; ++i) {
    if (startPos < getQuasiRange(quasis[i]).start) {
      return i - 1;
    }
  }

  // We haven't found it, it probably means that some of the locations are off.
  // Let's just return the first one.
  /* istanbul ignore next */
  return 0;
}

function getQuasiRange(expr) {
  if (expr.start !== undefined) {
    // Babylon
    return { start: expr.start, end: expr.end };
  }
  // Flow
  return { start: expr.range[0], end: expr.range[1] };
}

function printLeadingComment(commentPath, print, options) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath, options);
  if (!contents) {
    return "";
  }
  const isBlock = util.isBlockComment(comment);

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    return concat([
      contents,
      util.hasNewline(options.originalText, locEnd(comment)) ? hardline : " "
    ]);
  }

  return concat([contents, hardline]);
}

function printTrailingComment(commentPath, print, options) {
  const comment = commentPath.getValue();
  const contents = printComment(commentPath, options);
  if (!contents) {
    return "";
  }
  const isBlock = util.isBlockComment(comment);

  // We don't want the line to break
  // when the parentParentNode is a ClassDeclaration/-Expression
  // And the parentNode is in the superClass property
  const parentNode = commentPath.getNode(1);
  const parentParentNode = commentPath.getNode(2);
  const isParentSuperClass =
    parentParentNode &&
    (parentParentNode.type === "ClassDeclaration" ||
      parentParentNode.type === "ClassExpression") &&
    parentParentNode.superClass === parentNode;

  if (
    util.hasNewline(options.originalText, locStart(comment), {
      backwards: true
    })
  ) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.

    const isLineBeforeEmpty = util.isPreviousLineEmpty(
      options.originalText,
      comment
    );

    return lineSuffix(
      concat([hardline, isLineBeforeEmpty ? hardline : "", contents])
    );
  } else if (isBlock || isParentSuperClass) {
    // Trailing block comments never need a newline
    return concat([" ", contents]);
  }

  return concat([lineSuffix(" " + contents), !isBlock ? breakParent : ""]);
}

function printDanglingComments(path, options, sameIndent, filter) {
  const parts = [];
  const node = path.getValue();

  if (!node || !node.comments) {
    return "";
  }

  path.each(commentPath => {
    const comment = commentPath.getValue();
    if (
      comment &&
      !comment.leading &&
      !comment.trailing &&
      (!filter || filter(comment))
    ) {
      parts.push(printComment(commentPath, options));
    }
  }, "comments");

  if (parts.length === 0) {
    return "";
  }

  if (sameIndent) {
    return join(hardline, parts);
  }
  return indent(concat([hardline, join(hardline, parts)]));
}

function prependCursorPlaceholder(path, options, printed) {
  if (path.getNode() === options.cursorNode && path.getValue()) {
    return concat([cursor, printed]);
  }
  return printed;
}

function printComments(path, print, options, needsSemi) {
  const value = path.getValue();
  const printed = print(path);
  const comments = value && value.comments;

  if (!comments || comments.length === 0) {
    return prependCursorPlaceholder(path, options, printed);
  }

  const leadingParts = [];
  const trailingParts = [needsSemi ? ";" : "", printed];

  path.each(commentPath => {
    const comment = commentPath.getValue();
    const leading = comment.leading;
    const trailing = comment.trailing;

    if (leading) {
      const contents = printLeadingComment(commentPath, print, options);
      if (!contents) {
        return;
      }
      leadingParts.push(contents);

      const text = options.originalText;
      if (util.hasNewline(text, util.skipNewline(text, util.locEnd(comment)))) {
        leadingParts.push(hardline);
      }
    } else if (trailing) {
      trailingParts.push(printTrailingComment(commentPath, print, options));
    }
  }, "comments");

  return prependCursorPlaceholder(
    path,
    options,
    concat(leadingParts.concat(trailingParts))
  );
}

module.exports = {
  attach,
  printComments,
  printDanglingComments,
  getSortedChildNodes
};
