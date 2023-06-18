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
      throwErrorOnTsNode(modifier, "Decorators are not valid here.");
    }
  }
}

function throwErrorForInvalidNodes({ ast, esTreeNodeToTSNodeMap }, text) {
  if (!text.includes("@")) {
    return;
  }

  visitNode(ast, (esTreeNode) => {
    const tsNode = esTreeNodeToTSNodeMap.get(esTreeNode);
    if (!tsNode) {
      return;
    }

    throwErrorForInvalidModifier(tsNode);
  });
}

export { throwErrorForInvalidNodes };
