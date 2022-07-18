import { isNonEmptyArray } from "../../common/util.js";
import { indent, join, line } from "../../document/builders.js";
import { isFlowAnnotationComment } from "../utils/index.js";

function printOptionalToken(path) {
  const node = path.getValue();
  if (
    !node.optional ||
    // It's an optional computed method parsed by typescript-estree.
    // "?" is printed in `printMethod`.
    (node.type === "Identifier" && node === path.getParentNode().key)
  ) {
    return "";
  }
  if (
    node.type === "OptionalCallExpression" ||
    (node.type === "OptionalMemberExpression" && node.computed)
  ) {
    return "?.";
  }
  return "?";
}

function printDefiniteToken(path) {
  return path.getValue().definite ||
    path.match(
      undefined,
      (node, name) =>
        name === "id" && node.type === "VariableDeclarator" && node.definite
    )
    ? "!"
    : "";
}

function printFunctionTypeParameters(path, options, print) {
  const fun = path.getValue();
  if (fun.typeArguments) {
    return print("typeArguments");
  }
  if (fun.typeParameters) {
    return print("typeParameters");
  }
  return "";
}

async function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation)) {
    return [" /*: ", await print("typeAnnotation"), " */"];
  }

  return [
    isFunctionDeclarationIdentifier ? "" : ": ",
    await print("typeAnnotation"),
  ];
}

async function printBindExpressionCallee(path, options, print) {
  return ["::", await print("callee")];
}

async function printTypeScriptModifiers(path, options, print) {
  const node = path.getValue();
  if (!isNonEmptyArray(node.modifiers)) {
    return "";
  }
  return [join(" ", await path.map(print, "modifiers")), " "];
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

async function printRestSpread(path, options, print) {
  return [
    "...",
    await print("argument"),
    await printTypeAnnotation(path, options, print),
  ];
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
};
