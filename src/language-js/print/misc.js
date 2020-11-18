"use strict";

const { isNumericLiteral } = require("../utils");

const {
  builders: { concat, softline, group, indent },
} = require("../../document");

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

function printFunctionTypeParameters(path, options, print) {
  const fun = path.getValue();
  if (fun.typeArguments) {
    return path.call(print, "typeArguments");
  }
  if (fun.typeParameters) {
    return path.call(print, "typeParameters");
  }
  return "";
}

function printMemberLookup(path, options, print) {
  const property = path.call(print, "property");
  const n = path.getValue();
  const optional = printOptionalToken(path);

  if (!n.computed) {
    return concat([optional, ".", property]);
  }

  if (!n.property || isNumericLiteral(n.property)) {
    return concat([optional, "[", property, "]"]);
  }

  return group(
    concat([optional, "[", indent(concat([softline, property])), softline, "]"])
  );
}

function printBindExpressionCallee(path, options, print) {
  return concat(["::", path.call(print, "callee")]);
}

function printTSAsExpression(path, options, print) {
  const node = path.getValue();
  const name = path.getName();
  const parent = path.getParentNode();

  const shouldIndentTypeAnnotation =
    node.expression.type !== "ConditionalExpression" &&
    node.expression.type !== "ObjectExpression" &&
    node.expression.type !== "ArrayExpression" &&
    parent.type !== "VariableDeclarator" &&
    parent.type !== "AssignmentExpression" &&
    parent.type !== "Property" &&
    parent.type !== "ObjectProperty";
  const printedTypeAnnotation = path.call(print, "typeAnnotation");
  const content = concat([
    path.call(print, "expression"),
    " as ",
    shouldIndentTypeAnnotation
      ? group(indent(concat([softline, printedTypeAnnotation])))
      : printedTypeAnnotation,
  ]);

  const shouldIndent =
    node.expression.type !== "ObjectExpression" &&
    node.expression.type !== "ArrayExpression" &&
    ((parent.type === "VariableDeclarator" && name === "init") ||
      (parent.type === "AssignmentExpression" && name === "right") ||
      ((parent.type === "Property" || parent.type === "ObjectProperty") &&
        name === "value"));
  if (shouldIndent) {
    return group(indent(concat([softline, content])));
  }
  return content;
}

module.exports = {
  printOptionalToken,
  printFunctionTypeParameters,
  printMemberLookup,
  printBindExpressionCallee,
  printTSAsExpression,
};
