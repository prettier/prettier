import ts from "typescript";
import createError from "../../../common/parser-create-error.js";
import visitNode from "./visit-node.js";

function throwErrorOnTsNode(node, message) {
  throw createError(message, { loc: getTsNodeLocation(node) });
}

function getTsNodeLocation(nodeOrToken) {
  const sourceFile =
    // @ts-expect-error -- internal?
    ts.getSourceFileOfNode(nodeOrToken);
  const [start, end] = [
    nodeOrToken.getStart(sourceFile),
    nodeOrToken.getEnd(),
  ].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column: column + 1 };
  });

  return { start, end };
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
