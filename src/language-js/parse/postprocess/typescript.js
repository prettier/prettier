import ts from "typescript";
import isNonEmptyArray from "../../../utils/is-non-empty-array.js";
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

// Based on `checkGrammarModifiers` function in `typescript`
function throwErrorForInvalidModifier(node) {
  const { modifiers } = node;
  if (!isNonEmptyArray(modifiers)) {
    return;
  }

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

    if (modifier.kind !== SyntaxKind.ReadonlyKeyword) {
      if (
        node.kind === SyntaxKind.PropertySignature ||
        node.kind === SyntaxKind.MethodSignature
      ) {
        throwErrorOnTsNode(
          modifier,
          `'${ts.tokenToString(
            modifier.kind
          )}' modifier cannot appear on a type member`
        );
      }

      if (
        node.kind === SyntaxKind.IndexSignature &&
        (modifier.kind !== SyntaxKind.StaticKeyword ||
          !ts.isClassLike(node.parent))
      ) {
        throwErrorOnTsNode(
          modifier,
          `'${ts.tokenToString(
            modifier.kind
          )}' modifier cannot appear on an index signature`
        );
      }
    }

    if (
      modifier.kind !== SyntaxKind.InKeyword &&
      modifier.kind !== SyntaxKind.OutKeyword &&
      modifier.kind !== SyntaxKind.ConstKeyword &&
      node.kind === SyntaxKind.TypeParameter
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier cannot appear on a type parameter`
      );
    }

    if (
      (modifier.kind === SyntaxKind.InKeyword ||
        modifier.kind === SyntaxKind.OutKeyword) &&
      (node.kind !== SyntaxKind.TypeParameter ||
        !(
          ts.isInterfaceDeclaration(node.parent) ||
          ts.isClassLike(node.parent) ||
          ts.isTypeAliasDeclaration(node.parent)
        ))
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier can only appear on a type parameter of a class, interface or type alias`
      );
    }

    if (
      modifier.kind === SyntaxKind.ReadonlyKeyword &&
      node.kind !== SyntaxKind.PropertyDeclaration &&
      node.kind !== SyntaxKind.PropertySignature &&
      node.kind !== SyntaxKind.IndexSignature &&
      node.kind !== SyntaxKind.Parameter
    ) {
      throwErrorOnTsNode(
        modifier,
        "'readonly' modifier can only appear on a property declaration or index signature."
      );
    }

    if (
      modifier.kind === SyntaxKind.DeclareKeyword &&
      ts.isClassLike(node.parent) &&
      !ts.isPropertyDeclaration(node)
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier cannot appear on class elements of this kind.`
      );
    }

    if (
      modifier.kind === SyntaxKind.AbstractKeyword &&
      node.kind !== SyntaxKind.ClassDeclaration &&
      node.kind !== SyntaxKind.ConstructorType &&
      node.kind !== SyntaxKind.MethodDeclaration &&
      node.kind !== SyntaxKind.PropertyDeclaration &&
      node.kind !== SyntaxKind.GetAccessor &&
      node.kind !== SyntaxKind.SetAccessor
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier can only appear on a class, method, or property declaration.`
      );
    }

    if (
      (modifier.kind === SyntaxKind.StaticKeyword ||
        modifier.kind === SyntaxKind.PublicKeyword ||
        modifier.kind === SyntaxKind.ProtectedKeyword ||
        modifier.kind === SyntaxKind.PrivateKeyword) &&
      (node.parent.kind === SyntaxKind.ModuleBlock ||
        node.parent.kind === SyntaxKind.SourceFile)
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier cannot appear on a module or namespace element.`
      );
    }

    if (
      modifier.kind === SyntaxKind.AccessorKeyword &&
      node.kind !== SyntaxKind.PropertyDeclaration
    ) {
      throwErrorOnTsNode(
        modifier,
        "'accessor' modifier can only appear on a property declaration."
      );
    }

    // `checkGrammarAsyncModifier` function in `typescript`
    if (
      modifier.kind === SyntaxKind.AsyncKeyword &&
      node.kind !== SyntaxKind.MethodDeclaration &&
      node.kind !== SyntaxKind.FunctionDeclaration &&
      node.kind !== SyntaxKind.FunctionExpression &&
      node.kind !== SyntaxKind.ArrowFunction
    ) {
      throwErrorOnTsNode(modifier, "'async' modifier cannot be used here.");
    }

    // `checkGrammarModifiers` function in `typescript`
    if (
      node.kind === SyntaxKind.Parameter &&
      (modifier.kind === SyntaxKind.StaticKeyword ||
        modifier.kind === SyntaxKind.ExportKeyword ||
        modifier.kind === SyntaxKind.DeclareKeyword ||
        modifier.kind === SyntaxKind.AsyncKeyword)
    ) {
      throwErrorOnTsNode(
        modifier,
        `'${ts.tokenToString(
          modifier.kind
        )}' modifier cannot appear on a parameter.`
      );
    }

    // `checkParameter` function in `typescript`
    if (
      node.kind === SyntaxKind.Parameter &&
      // @ts-expect-error -- internal?
      ts.hasSyntacticModifier(node, ts.ModifierFlags.ParameterPropertyModifier)
    ) {
      const func =
        // @ts-expect-error -- internal?
        ts.getContainingFunction(node);
      if (
        !(
          func.kind === SyntaxKind.Constructor &&
          // @ts-expect-error -- internal?
          ts.nodeIsPresent(func.body)
        )
      ) {
        throwErrorOnTsNode(
          modifier,
          "A parameter property is only allowed in a constructor implementation."
        );
      }
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

// `isModifierKind` in `typescript`
const POSSIBLE_MODIFIERS = [
  "abstract",
  "accessor",
  "async",
  "const",
  "declare",
  "default",
  "export",
  "in",
  "out",
  "override",
  "private",
  "protected",
  "public",
  "readonly",
  "static",
];

const decoratorOrModifierRegExp = new RegExp(
  ["@", ...POSSIBLE_MODIFIERS].join("|")
);

function throwErrorForInvalidNodes(tsParseResult, text) {
  if (!decoratorOrModifierRegExp.test(text)) {
    return;
  }

  visitNode(tsParseResult.ast, (esTreeNode) => {
    const tsNode = getTsNode(esTreeNode, tsParseResult);
    if (!tsNode) {
      return;
    }

    throwErrorForInvalidAbstractProperty(tsNode, esTreeNode);
    throwErrorForInvalidModifier(tsNode);
  });
}

export {
  throwErrorForInvalidNodes,
  // For test
  POSSIBLE_MODIFIERS,
};
