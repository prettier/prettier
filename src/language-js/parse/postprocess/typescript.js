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


function throwErrorOnTsNode(node) {
  const sourceFile = getSourceFileOfNode(node);
  const [start, end] = [node.getStart(), node.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  throwSyntaxError({ loc: { start, end } }, "Decorators are not valid here.");
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
    if (ts.isDecorator(modifier)) {
      const legacyDecorators = true;
      if (
        // @ts-expect-error -- internal?
        !ts.nodeCanBeDecorated(
          legacyDecorators,
          node,
          node.parent,
          node.parent.parent
        )
      ) {
        if (
          node.kind === SyntaxKind.MethodDeclaration &&
          // @ts-expect-error -- internal?
          !ts.nodeIsPresent(node.body)
        ) {
          throwErrorOnTsNode(
            modifier,
            "A decorator can only decorate a method implementation, not an overload."
          );
        } else {
          throwErrorOnTsNode(modifier, "Decorators are not valid here.");
        }
      } else if (
        legacyDecorators &&
        (node.kind === SyntaxKind.GetAccessor ||
          node.kind === SyntaxKind.SetAccessor)
      ) {
        // @ts-expect-error -- internal?
        const accessors = ts.getAllAccessorDeclarations(
          node.parent.members,
          node
        );
        if (
          // @ts-expect-error -- internal?
          ts.hasDecorators(accessors.firstAccessor) &&
          node === accessors.secondAccessor
        ) {
          throwErrorOnTsNode(
            modifier,
            "Decorators cannot be applied to multiple get/set accessors of the same name."
          );
        }
      }
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
