"use strict";

const isNonEmptyArray = require("../../../utils/is-non-empty-array.js");
const visitNode = require("./visit-node.js");
const throwSyntaxError = require("./throw-syntax-error.js");

// Taken from `typescript` package
const SyntaxKind = {
  AbstractKeyword: 126,
  SourceFile: 308,
  PropertyDeclaration: 169,
};

// Copied from https://unpkg.com/typescript@4.8.2/lib/typescript.js
function getSourceFileOfNode(node) {
  while (node && node.kind !== SyntaxKind.SourceFile) {
    node = node.parent;
  }
  return node;
}

// Invalid decorators are removed since `@typescript-eslint/typescript-estree` v4
// https://github.com/typescript-eslint/typescript-eslint/pull/2375
// There is a `checkGrammarDecorators` in `typescript` package, consider use it directly in future
function throwErrorForInvalidDecorator(tsNode) {
  const { illegalDecorators } = tsNode;
  if (!isNonEmptyArray(illegalDecorators)) {
    return;
  }

  const [{ expression }] = illegalDecorators;

  const sourceFile = getSourceFileOfNode(expression);
  const [start, end] = [expression.pos, expression.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  throwSyntaxError({ loc: { start, end } }, "Decorators are not valid here.");
}

// Values of abstract property is removed since `@typescript-eslint/typescript-estree` v5
// https://github.com/typescript-eslint/typescript-eslint/releases/tag/v5.0.0
function throwErrorForInvalidAbstractProperty(tsNode, esTreeNode) {
  if (
    tsNode.kind !== SyntaxKind.PropertyDeclaration ||
    (tsNode.modifiers &&
      !tsNode.modifiers.some(
        (modifier) => modifier.kind === SyntaxKind.AbstractKeyword
      ))
  ) {
    return;
  }
  if (tsNode.initializer && esTreeNode.value === null) {
    throwSyntaxError(
      esTreeNode,
      "Abstract property cannot have an initializer"
    );
  }
}

function throwErrorForInvalidNodes(ast, options) {
  const { esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap } =
    options.tsParseResult;

  visitNode(ast, (node) => {
    const tsNode = esTreeNodeToTSNodeMap.get(node);
    if (!tsNode) {
      return;
    }
    const esTreeNode = tsNodeToESTreeNodeMap.get(tsNode);
    if (esTreeNode !== node) {
      return;
    }

    throwErrorForInvalidDecorator(tsNode);
    throwErrorForInvalidAbstractProperty(tsNode, esTreeNode);
  });
}

module.exports = { throwErrorForInvalidNodes };
