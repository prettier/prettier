import isNonEmptyArray from "../../../utils/is-non-empty-array.js";
import visitNode from "./visit-node.js";
import throwTsSyntaxError from "./throw-ts-syntax-error.js";

let ts;

function getTsNodeLocation(nodeOrToken) {
  const sourceFile = ts.getSourceFileOfNode(nodeOrToken);
  const [start, end] = [nodeOrToken.pos, nodeOrToken.end].map((position) => {
    const { line, character: column } =
      sourceFile.getLineAndCharacterOfPosition(position);
    return { line: line + 1, column };
  });

  return { start, end };
}

function throwErrorOnTsNode(node, message) {
  throwTsSyntaxError({ loc: getTsNodeLocation(node) }, message);
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

  throwErrorOnTsNode(expression, "Decorators are not valid here.");
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

function throwErrorForInvalidDeclare(tsNode, esTreeNode) {
  if (
    !(
      esTreeNode.type === "MethodDefinition" &&
      (esTreeNode.kind === "get" || esTreeNode.kind === "set")
    )
  ) {
    return;
  }

  const declareKeyword = tsNode.modifiers?.find(
    (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
  );

  if (!declareKeyword) {
    return;
  }

  throwErrorOnTsNode(
    declareKeyword,
    /* cspell:disable-next-line */
    `'declare' is not allowed in ${esTreeNode.kind}ters.`
  );
}

function throwErrorForInvalidModifierOnTypeParameter(tsNode, esTreeNode) {
  if (
    esTreeNode.type !== "TSMethodSignature" ||
    tsNode.kind !== ts.SyntaxKind.MethodSignature
  ) {
    return;
  }

  const invalidModifier = tsNode.modifiers?.find(
    (modifier) =>
      !(
        modifier.kind === ts.SyntaxKind.InKeyword ||
        modifier.kind === ts.SyntaxKind.OutKeyword
      )
  );

  if (!invalidModifier) {
    return;
  }

  throwErrorOnTsNode(
    invalidModifier,
    "This modifier cannot appear on a type member"
  );
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

async function throwErrorForInvalidNodes(tsParseResult, options) {
  if (
    // decorators
    // abstract properties
    // declare in accessor
    // modifiers on type parameter
    !/@|abstract|declare|interface/.test(options.originalText)
  ) {
    return;
  }

  if (!ts) {
    ({ default: ts } = await import("typescript"));
  }

  visitNode(tsParseResult.ast, (esTreeNode) => {
    const tsNode = getTsNode(esTreeNode, tsParseResult);
    if (!tsNode) {
      return;
    }

    throwErrorForInvalidDeclare(tsNode, esTreeNode);
    throwErrorForInvalidDecorator(tsNode);
    throwErrorForInvalidAbstractProperty(tsNode, esTreeNode);
    throwErrorForInvalidModifierOnTypeParameter(tsNode, esTreeNode);
  });
}

export { throwErrorForInvalidNodes };
