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

function throwErrorOnTsNode(node, message) {
  const sourceFile = getSourceFileOfNode(node);
  const [start, end] = [node.getStart(), node.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  throwSyntaxError({ loc: { start, end } }, message);
}

function nodeCanBeDecorated(node) {
  const ts = require("typescript");

  return [true, false].some((useLegacyDecorators) =>
    // @ts-expect-error -- internal?
    ts.nodeCanBeDecorated(
      useLegacyDecorators,
      node,
      node.parent,
      node.parent.parent
    )
  );
}

// Invalid decorators are removed since `@typescript-eslint/typescript-estree` v4
// https://github.com/typescript-eslint/typescript-eslint/pull/2375
// There is a `checkGrammarDecorators` in `typescript` package, consider use it directly in future
function throwErrorForInvalidDecorator(node) {
  const { modifiers } = node;
  if (!isNonEmptyArray(modifiers)) {
    return;
  }

  const ts = require("typescript");

  const { SyntaxKind } = ts;
  for (const modifier of modifiers) {
    if (ts.isDecorator(modifier) && !nodeCanBeDecorated(node)) {
      if (
        node.kind === SyntaxKind.MethodDeclaration &&
        // @ts-expect-error -- internal?
        !ts.nodeIsPresent(node.body)
      ) {
        throwErrorOnTsNode(
          modifier,
          "A decorator can only decorate a method implementation, not an overload."
        );
      }

      throwErrorOnTsNode(modifier, "Decorators are not valid here.");
    }
  }
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

function throwErrorForInvalidNodes(result, options) {
  if (
    // decorators or abstract properties
    !/@|abstract/.test(options.originalText)
  ) {
    return;
  }

  const { esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap } = result;

  visitNode(result.ast, (node) => {
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
