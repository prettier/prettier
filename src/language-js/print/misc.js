import { indent, line } from "../../document/builders.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

function printOptionalToken(path) {
  const { node } = path;
  if (
    !node.optional ||
    // It's an optional computed method parsed by typescript-estree.
    // "?" is printed in `printMethod`.
    (node.type === "Identifier" && node === path.parent.key)
  ) {
    return "";
  }
  if (
    node.type === "OptionalCallExpression" ||
    (node.type === "OptionalMemberExpression" && node.computed) ||
    node.type === "OptionalIndexedAccessType"
  ) {
    return "?.";
  }
  return "?";
}

function printDefiniteToken(path) {
  return path.node.definite ||
    path.match(
      undefined,
      (node, name) =>
        name === "id" && node.type === "VariableDeclarator" && node.definite
    )
    ? "!"
    : "";
}

const flowDeclareNodeTypes = new Set([
  "DeclareClass",
  "DeclareFunction",
  "DeclareVariable",
  "DeclareExportDeclaration",
  "DeclareExportAllDeclaration",
  "DeclareOpaqueType",
  "DeclareTypeAlias",
  "DeclareEnum",
  "DeclareInterface",
]);
function printDeclareToken(path) {
  const { node } = path;

  return (
    // TypeScript
    node.declare ||
      // Flow
      (flowDeclareNodeTypes.has(node.type) &&
        path.parent.type !== "DeclareExportDeclaration")
      ? "declare "
      : ""
  );
}

const tsAbstractNodeTypes = new Set([
  "TSAbstractMethodDefinition",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);
function printAbstractToken({ node }) {
  return node.abstract || tsAbstractNodeTypes.has(node.type) ? "abstract " : "";
}

function printFunctionTypeParameters(path, options, print) {
  const fun = path.node;
  if (fun.typeArguments) {
    return print("typeArguments");
  }
  if (fun.typeParameters) {
    return print("typeParameters");
  }
  return "";
}

function printBindExpressionCallee(path, options, print) {
  return ["::", print("callee")];
}

function adjustClause(node, clause, forceSpace) {
  if (node.type === "EmptyStatement") {
    return ";";
  }

  if (node.type === "BlockStatement" || forceSpace) {
    return [" ", clause];
  }

  return indent([line, clause]);
}

function printRestSpread(path, print) {
  return ["...", print("argument"), printTypeAnnotationProperty(path, print)];
}

function printDirective(rawText, options) {
  const rawContent = rawText.slice(1, -1);

  // Check for the alternate quote, to determine if we're allowed to swap
  // the quotes on a DirectiveLiteral.
  if (rawContent.includes('"') || rawContent.includes("'")) {
    return rawText;
  }

  const enclosingQuote = options.singleQuote ? "'" : '"';

  // Directives are exact code unit sequences, which means that you can't
  // change the escape sequences they use.
  // See https://github.com/prettier/prettier/issues/1555
  // and https://tc39.github.io/ecma262/#directive-prologue
  return enclosingQuote + rawContent + enclosingQuote;
}

function printTypeScriptAccessibilityToken(node) {
  return node.accessibility ? node.accessibility + " " : "";
}

export {
  printOptionalToken,
  printDefiniteToken,
  printDeclareToken,
  printAbstractToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
  printRestSpread,
  adjustClause,
  printDirective,
  printTypeScriptAccessibilityToken,
};
