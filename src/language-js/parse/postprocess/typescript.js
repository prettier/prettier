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

function throwErrorForInvalidModifier(node) {
  for (const modifier of node.modifiers ?? []) {
    if (ts.isDecorator(modifier)) {
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
