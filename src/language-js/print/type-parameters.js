"use strict";

const { printDanglingComments } = require("../../main/comments");
const {
  builders: { join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const {
  isTestCall,
  hasComment,
  CommentCheckFlags,
  isTSXFile,
  shouldPrintComma,
  getFunctionParameters,
} = require("../utils");
const { createGroupIdMapper } = require("../../common/util");
const { shouldHugType } = require("./type-annotation");

const getTypeParametersGroupId = createGroupIdMapper("typeParameters");

function printTypeParameters(path, options, print, paramsKey) {
  const n = path.getValue();

  if (!n[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(n[paramsKey])) {
    return path.call(print, paramsKey);
  }

  const grandparent = path.getNode(2);
  const isParameterInTestCall = grandparent != null && isTestCall(grandparent);

  const shouldInline =
    isParameterInTestCall ||
    n[paramsKey].length === 0 ||
    (n[paramsKey].length === 1 &&
      (shouldHugType(n[paramsKey][0]) ||
        (n[paramsKey][0].type === "GenericTypeAnnotation" &&
          shouldHugType(n[paramsKey][0].id)) ||
        (n[paramsKey][0].type === "TSTypeReference" &&
          shouldHugType(n[paramsKey][0].typeName)) ||
        n[paramsKey][0].type === "NullableTypeAnnotation"));

  if (shouldInline) {
    return [
      "<",
      join(", ", path.map(print, paramsKey)),
      printDanglingCommentsForInline(path, options),
      ">",
    ];
  }

  return group(
    [
      "<",
      indent([softline, join([",", line], path.map(print, paramsKey))]),
      ifBreak(
        options.parser !== "typescript" &&
          options.parser !== "babel-ts" &&
          shouldPrintComma(options, "all")
          ? ","
          : ""
      ),
      softline,
      ">",
    ],
    { id: getTypeParametersGroupId(n) }
  );
}

function printDanglingCommentsForInline(path, options) {
  const n = path.getValue();
  if (!hasComment(n, CommentCheckFlags.Dangling)) {
    return "";
  }
  const hasOnlyBlockComments = !hasComment(n, CommentCheckFlags.Line);
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
  const n = path.getValue();
  const parts = [];
  const parent = path.getParentNode();
  if (parent.type === "TSMappedType") {
    parts.push("[", path.call(print, "name"));
    if (n.constraint) {
      parts.push(" in ", path.call(print, "constraint"));
    }
    if (parent.nameType) {
      parts.push(
        " as ",
        path.callParent((path) => path.call(print, "nameType"))
      );
    }
    parts.push("]");
    return parts;
  }

  if (n.variance) {
    parts.push(path.call(print, "variance"));
  }

  parts.push(path.call(print, "name"));

  if (n.bound) {
    parts.push(": ");
    parts.push(path.call(print, "bound"));
  }

  if (n.constraint) {
    parts.push(" extends ", path.call(print, "constraint"));
  }

  if (n.default) {
    parts.push(" = ", path.call(print, "default"));
  }

  // Keep comma if the file extension is .tsx and
  // has one type parameter that isn't extend with any types.
  // Because, otherwise formatted result will be invalid as tsx.
  const grandParent = path.getNode(2);
  if (
    getFunctionParameters(parent).length === 1 &&
    isTSXFile(options) &&
    !n.constraint &&
    grandParent.type === "ArrowFunctionExpression"
  ) {
    parts.push(",");
  }

  return parts;
}

module.exports = {
  printTypeParameter,
  printTypeParameters,
  getTypeParametersGroupId,
};
