import { isNonEmptyArray } from "../../common/util.js";
import { indent, join, line } from "../../document/builders.js";

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

function printTypeAnnotation(path, options, print) {
  const { node, parent, key } = path;
  if (!node.typeAnnotation) {
    return "";
  }

  const isFunctionDeclarationIdentifier =
    parent.type === "DeclareFunction" && key === "id";

  return [isFunctionDeclarationIdentifier ? "" : ": ", print("typeAnnotation")];
}

function printBindExpressionCallee(path, options, print) {
  return ["::", print("callee")];
}

function printTypeScriptModifiers(path, options, print) {
  const { node } = path;
  if (!isNonEmptyArray(node.modifiers)) {
    return "";
  }
  return [join(" ", path.map(print, "modifiers")), " "];
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

function printRestSpread(path, options, print) {
  return ["...", print("argument"), printTypeAnnotation(path, options, print)];
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

export {
  printOptionalToken,
  printDefiniteToken,
  printFunctionTypeParameters,
  printBindExpressionCallee,
  printTypeScriptModifiers,
  printTypeAnnotation,
  printRestSpread,
  adjustClause,
  printDirective,
};
