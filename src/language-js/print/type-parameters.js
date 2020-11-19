"use strict";

const { printDanglingComments } = require("../../main/comments");
const {
  builders: { concat, join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const {
  hasDanglingComments,
  isTestCall,
  isBlockComment,
  shouldPrintComma,
} = require("../utils");
const { shouldHugType } = require("./type-annotation");

const typeParametersGroupIds = new WeakMap();
function getTypeParametersGroupId(node) {
  if (!typeParametersGroupIds.has(node)) {
    typeParametersGroupIds.set(node, Symbol("typeParameters"));
  }
  return typeParametersGroupIds.get(node);
}

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

  function printDanglingCommentsForInline(n) {
    if (!hasDanglingComments(n)) {
      return "";
    }
    const hasOnlyBlockComments = n.comments.every((comment) =>
      isBlockComment(comment)
    );
    const printed = printDanglingComments(
      path,
      options,
      /* sameIndent */ hasOnlyBlockComments
    );
    if (hasOnlyBlockComments) {
      return printed;
    }
    return concat([printed, hardline]);
  }

  if (shouldInline) {
    return concat([
      "<",
      join(", ", path.map(print, paramsKey)),
      printDanglingCommentsForInline(n),
      ">",
    ]);
  }

  return group(
    concat([
      "<",
      indent(
        concat([
          softline,
          join(concat([",", line]), path.map(print, paramsKey)),
        ])
      ),
      ifBreak(
        options.parser !== "typescript" &&
          options.parser !== "babel-ts" &&
          shouldPrintComma(options, "all")
          ? ","
          : ""
      ),
      softline,
      ">",
    ]),
    { id: getTypeParametersGroupId(n) }
  );
}

module.exports = { printTypeParameters, getTypeParametersGroupId };
