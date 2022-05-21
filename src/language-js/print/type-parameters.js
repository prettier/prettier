"use strict";

const { printDanglingComments } = require("../../main/comments.js");
const {
  builders: { join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document/index.js");
const {
  isTestCall,
  hasComment,
  CommentCheckFlags,
  isTSXFile,
  shouldPrintComma,
  getFunctionParameters,
  isObjectType,
} = require("../utils/index.js");
const { createGroupIdMapper } = require("../../common/util.js");
const { shouldHugType } = require("./type-annotation.js");
const { isArrowFunctionVariableDeclarator } = require("./assignment.js");

const getTypeParametersGroupId = createGroupIdMapper("typeParameters");

function printTypeParameters(path, options, print, paramsKey) {
  const node = path.getValue();

  if (!node[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(node[paramsKey])) {
    return print(paramsKey);
  }

  const grandparent = path.getNode(2);
  const isParameterInTestCall = grandparent && isTestCall(grandparent);

  const isArrowFunctionVariable = path.match(
    (node) =>
      !(node[paramsKey].length === 1 && isObjectType(node[paramsKey][0])),
    undefined,
    (node, name) => name === "typeAnnotation",
    (node) => node.type === "Identifier",
    isArrowFunctionVariableDeclarator
  );

  const shouldInline =
    !isArrowFunctionVariable &&
    (isParameterInTestCall ||
      node[paramsKey].length === 0 ||
      (node[paramsKey].length === 1 &&
        (node[paramsKey][0].type === "NullableTypeAnnotation" ||
          shouldHugType(node[paramsKey][0]))));

  if (shouldInline) {
    return [
      "<",
      join(", ", path.map(print, paramsKey)),
      printDanglingCommentsForInline(path, options),
      ">",
    ];
  }

  // Keep comma if the file extension is .tsx and
  // has one type parameter that isn't extend with any types.
  // Because, otherwise formatted result will be invalid as tsx.
  const trailingComma =
    node.type === "TSTypeParameterInstantiation" // https://github.com/microsoft/TypeScript/issues/21984
      ? ""
      : getFunctionParameters(node).length === 1 &&
        isTSXFile(options) &&
        !node[paramsKey][0].constraint &&
        path.getParentNode().type === "ArrowFunctionExpression"
      ? ","
      : shouldPrintComma(options, "all")
      ? ifBreak(",")
      : "";

  return group(
    [
      "<",
      indent([softline, join([",", line], path.map(print, paramsKey))]),
      trailingComma,
      softline,
      ">",
    ],
    { id: getTypeParametersGroupId(node) }
  );
}

function printDanglingCommentsForInline(path, options) {
  const node = path.getValue();
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return "";
  }
  const hasOnlyBlockComments = !hasComment(node, CommentCheckFlags.Line);
  const printed = printDanglingComments(
    path,
    options,
    /* sameIndent */ hasOnlyBlockComments
  );
  if (hasOnlyBlockComments) {
    return printed;
  }
  return [printed, hardline];
}

function printTypeParameter(path, options, print) {
  const node = path.getValue();
  const parts = [];
  const parent = path.getParentNode();
  if (parent.type === "TSMappedType") {
    parts.push("[", print("name"));
    if (node.constraint) {
      parts.push(" in ", print("constraint"));
    }
    if (parent.nameType) {
      parts.push(
        " as ",
        path.callParent(() => print("nameType"))
      );
    }
    parts.push("]");
    return parts;
  }

  if (node.variance) {
    parts.push(print("variance"));
  }

  if (node.in) {
    parts.push("in ");
  }

  if (node.out) {
    parts.push("out ");
  }

  parts.push(print("name"));

  if (node.bound) {
    parts.push(": ", print("bound"));
  }

  if (node.constraint) {
    parts.push(" extends ", print("constraint"));
  }

  if (node.default) {
    parts.push(" = ", print("default"));
  }

  return parts;
}

module.exports = {
  printTypeParameter,
  printTypeParameters,
  getTypeParametersGroupId,
};
