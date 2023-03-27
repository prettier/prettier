import ts from "typescript";
import visitNode from "./visit-node.js";
import throwTsSyntaxError from "./throw-ts-syntax-error.js";

function getTsNodeLocation(nodeOrToken) {
  const sourceFile =
    // @ts-expect-error -- internal?
    ts.getSourceFileOfNode(nodeOrToken);
  const position =
    // @ts-expect-error -- internal?
    ts.rangeOfNode(nodeOrToken);
  const [start, end] = [position.pos, position.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  return { start, end };
}

function throwErrorOnTsNode(node, message) {
  throwTsSyntaxError({ loc: getTsNodeLocation(node) }, message);
}

// Values of abstract property is removed since `@typescript-eslint/typescript-estree` v5
// https://github.com/typescript-eslint/typescript-eslint/releases/tag/v5.0.0
function throwErrorForInvalidAbstractProperty(tsNode, esTreeNode) {
  if (
    !(
      tsNode.kind === ts.SyntaxKind.PropertyDeclaration &&
      tsNode.initializer &&
      esTreeNode.value === null &&
      tsNode.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.AbstractKeyword
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

function nodeCanBeDecorated(node) {
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

function throwErrorForInvalidModifier(node) {
  for (const modifier of node.modifiers ?? []) {
    if (ts.isDecorator(modifier) && !nodeCanBeDecorated(node)) {
      if (
        node.kind === ts.SyntaxKind.MethodDeclaration &&
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

function getTsNode(node, tsParseResult) {
  const { esTreeNodeToTSNodeMap, tsNodeToESTreeNodeMap } = tsParseResult;
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

function throwErrorForInvalidNodes(tsParseResult, text) {
  if (!text.includes("@")) {
    return;
  }

  visitNode(tsParseResult.ast, (esTreeNode) => {
    const tsNode = getTsNode(esTreeNode, tsParseResult);
    if (!tsNode) {
      return;
    }

    throwErrorForInvalidModifier(tsNode);
  });
}

export { throwErrorForInvalidNodes };
