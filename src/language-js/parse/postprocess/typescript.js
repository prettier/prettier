import isNonEmptyArray from "../../../utils/is-non-empty-array.js";
import visitNode from "./visit-node.js";
import throwTsSyntaxError from "./throw-ts-syntax-error.js";

// Taken from `typescript` package
const SyntaxKind = {
  AbstractKeyword: 126,
  SourceFile: 305,
  DeclareKeyword: 135,
  PropertyDeclaration: 167,
};

function getTsNodeLocation(nodeOrToken) {
  const sourceFile = getSourceFileOfNode(nodeOrToken);
  const [start, end] = [nodeOrToken.pos, nodeOrToken.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  return { start, end };
}

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

  throwTsSyntaxError(
    { loc: getTsNodeLocation(expression) },
    "Decorators are not valid here."
  );
}

// Values of abstract property is removed since `@typescript-eslint/typescript-estree` v5
// https://github.com/typescript-eslint/typescript-eslint/releases/tag/v5.0.0
function throwErrorForInvalidAbstractProperty(tsNode, esTreeNode) {
  if (
    !(
      tsNode.kind === SyntaxKind.PropertyDeclaration &&
      tsNode.initializer &&
      esTreeNode.value === null &&
      tsNode.modifiers.some(
        (modifier) => modifier.kind === SyntaxKind.AbstractKeyword
      )
    )
  ) {
    return;
  }

  throwTsSyntaxError(
    esTreeNode,
    "Abstract property cannot have an initializer"
  );
}

function throwErrorForInvalidDeclare(tsNode, esTreeNode) {
  if (
    !(
      esTreeNode.type === "MethodDefinition" &&
      (esTreeNode.kind === "get" || esTreeNode.kind === "set")
    )
  ) {
    return;
  }

  const declareKeyword = tsNode.modifiers.find(
    (modifier) => modifier.kind === SyntaxKind.DeclareKeyword
  );

  if (!declareKeyword) {
    return;
  }

  throwTsSyntaxError(
    { loc: getTsNodeLocation(declareKeyword) },
    /* cspell:disable-next-line */
    `'declare' is not allowed in ${esTreeNode.kind}ters.`
  );
}

function getTsNode(node, options) {
  const { esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap } =
    options.tsParseResult;
  const tsNode = esTreeNodeToTSNodeMap.get(node);
  if (!tsNode) {
    return;
  }

  const esTreeNode = tsNodeToESTreeNodeMap.get(tsNode);
  if (esTreeNode !== node) {
    return;
  }

  return tsNode;
}

function throwErrorForInvalidNodes(ast, options) {
  if (
    // decorators
    // abstract properties
    // declare in accessor
    !/@|abstract|declare/.test(options.originalText)
  ) {
    return;
  }

  visitNode(ast, (esTreeNode) => {
    const tsNode = getTsNode(esTreeNode, options);
    if (!tsNode) {
      return;
    }

    throwErrorForInvalidDeclare(tsNode, esTreeNode);
    throwErrorForInvalidDecorator(tsNode);
    throwErrorForInvalidAbstractProperty(tsNode, esTreeNode);
  });
}

export { throwErrorForInvalidNodes };
