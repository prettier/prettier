import visitNode from "./visit-node.js";
import throwTsSyntaxError from "./throw-ts-syntax-error.js";

// Copied from https://unpkg.com/typescript@4.8.2/lib/typescript.js
function getSourceFileOfNode(node) {
  while (node && node.kind !== 305 /* SyntaxKind.SourceFile */) {
    node = node.parent;
  }
  return node;
}

// Invalid decorators are removed since `@typescript-eslint/typescript-estree` v4
// https://github.com/typescript-eslint/typescript-eslint/pull/2375
function throwErrorForInvalidDecorator(tsNode) {
  const illegalDecorator = tsNode.illegalDecorators?.[0];
  if (!illegalDecorator) {
    return;
  }
console.log(illegalDecorator)
  const sourceFile = getSourceFileOfNode(illegalDecorator);
  const [start, end] = [illegalDecorator.pos, illegalDecorator.end].map(
    (position) => {
      const { line, character: column } =
        sourceFile.getLineAndCharacterOfPosition(position);
      return { line: line + 1, column };
    }
  );

  throwTsSyntaxError({ loc: { start, end } }, "Decorators are not valid here.");
}

// Values of abstract property is removed since `@typescript-eslint/typescript-estree` v5
// https://github.com/typescript-eslint/typescript-eslint/releases/tag/v5.0.0
function throwErrorForInvalidAbstractProperty(tsNode, esTreeNode) {
  const SYNTAX_KIND_PROPERTY_DEFINITION = 167;
  const SYNTAX_KIND_ABSTRACT_KEYWORD = 126;
  if (
    tsNode.kind !== SYNTAX_KIND_PROPERTY_DEFINITION ||
    (tsNode.modifiers &&
      !tsNode.modifiers.some(
        (modifier) => modifier.kind === SYNTAX_KIND_ABSTRACT_KEYWORD
      ))
  ) {
    return;
  }
  if (tsNode.initializer && esTreeNode.value === null) {
    throwTsSyntaxError(
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

export { throwErrorForInvalidNodes };
