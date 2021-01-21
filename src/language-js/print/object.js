"use strict";

const { printDanglingComments } = require("../../main/comments");
const {
  builders: { line, softline, group, indent, ifBreak, hardline },
} = require("../../document");
const {
  getLast,
  hasNewlineInRange,
  hasNewline,
  isNonEmptyArray,
} = require("../../common/util");
const {
  shouldPrintComma,
  hasComment,
  getComments,
  CommentCheckFlags,
  isNextLineEmpty,
} = require("../utils");
const { locStart, locEnd } = require("../loc");

const { printOptionalToken, printTypeAnnotation } = require("./misc");
const { shouldHugFunctionParameters } = require("./function-parameters");
const { shouldHugType } = require("./type-annotation");
const { printHardlineAfterHeritage } = require("./class");

/** @typedef {import("../../document").Doc} Doc */

function printObject(path, options, print) {
  const semi = options.semi ? ";" : "";
  const n = path.getValue();

  let propertiesField;

  if (n.type === "TSTypeLiteral") {
    propertiesField = "members";
  } else if (n.type === "TSInterfaceBody") {
    propertiesField = "body";
  } else {
    propertiesField = "properties";
  }

  const isTypeAnnotation = n.type === "ObjectTypeAnnotation";
  const fields = [];
  if (isTypeAnnotation) {
    fields.push("indexers", "callProperties", "internalSlots");
  }
  fields.push(propertiesField);

  const firstProperty = fields
    .map((field) => n[field][0])
    .sort((a, b) => locStart(a) - locStart(b))[0];

  const parent = path.getParentNode(0);
  const isFlowInterfaceLikeBody =
    isTypeAnnotation &&
    parent &&
    (parent.type === "InterfaceDeclaration" ||
      parent.type === "DeclareInterface" ||
      parent.type === "DeclareClass") &&
    path.getName() === "body";
  const shouldBreak =
    n.type === "TSInterfaceBody" ||
    isFlowInterfaceLikeBody ||
    (n.type === "ObjectPattern" &&
      parent.type !== "FunctionDeclaration" &&
      parent.type !== "FunctionExpression" &&
      parent.type !== "ArrowFunctionExpression" &&
      parent.type !== "ObjectMethod" &&
      parent.type !== "ClassMethod" &&
      parent.type !== "ClassPrivateMethod" &&
      parent.type !== "AssignmentPattern" &&
      parent.type !== "CatchClause" &&
      n.properties.some(
        (property) =>
          property.value &&
          (property.value.type === "ObjectPattern" ||
            property.value.type === "ArrayPattern")
      )) ||
    (n.type !== "ObjectPattern" &&
      firstProperty &&
      hasNewlineInRange(
        options.originalText,
        locStart(n),
        locStart(firstProperty)
      ));

  const separator = isFlowInterfaceLikeBody
    ? ";"
    : n.type === "TSInterfaceBody" || n.type === "TSTypeLiteral"
    ? ifBreak(semi, ";")
    : ",";
  const leftBrace = n.type === "RecordExpression" ? "#{" : n.exact ? "{|" : "{";
  const rightBrace = n.exact ? "|}" : "}";

  // Unfortunately, things are grouped together in the ast can be
  // interleaved in the source code. So we need to reorder them before
  // printing them.
  const propsAndLoc = [];
  fields.forEach((field) => {
    path.each((childPath) => {
      const node = childPath.getValue();
      propsAndLoc.push({
        node,
        printed: print(childPath),
        loc: locStart(node),
      });
    }, field);
  });

  /** @type {Doc[]} */
  let separatorParts = [];
  const props = propsAndLoc
    .sort((a, b) => a.loc - b.loc)
    .map((prop) => {
      const result = separatorParts.concat(group(prop.printed));
      separatorParts = [separator, line];
      if (
        (prop.node.type === "TSPropertySignature" ||
          prop.node.type === "TSMethodSignature" ||
          prop.node.type === "TSConstructSignatureDeclaration") &&
        hasComment(prop.node, CommentCheckFlags.PrettierIgnore)
      ) {
        separatorParts.shift();
      }
      if (isNextLineEmpty(prop.node, options)) {
        separatorParts.push(hardline);
      }
      return result;
    });

  if (n.inexact) {
    let printed;
    if (hasComment(n, CommentCheckFlags.Dangling)) {
      const hasLineComments = hasComment(n, CommentCheckFlags.Line);
      const printedDanglingComments = printDanglingComments(
        path,
        options,
        /* sameIndent */ true
      );
      printed = [
        printedDanglingComments,
        hasLineComments ||
        hasNewline(options.originalText, locEnd(getLast(getComments(n))))
          ? hardline
          : line,
        "...",
      ];
    } else {
      printed = "...";
    }
    props.push(separatorParts.concat(printed));
  }

  const lastElem = getLast(n[propertiesField]);

  const canHaveTrailingSeparator = !(
    n.inexact ||
    (lastElem && lastElem.type === "RestElement") ||
    (lastElem &&
      (lastElem.type === "TSPropertySignature" ||
        lastElem.type === "TSCallSignatureDeclaration" ||
        lastElem.type === "TSMethodSignature" ||
        lastElem.type === "TSConstructSignatureDeclaration") &&
      hasComment(lastElem, CommentCheckFlags.PrettierIgnore))
  );

  let content;
  if (props.length === 0) {
    if (!hasComment(n, CommentCheckFlags.Dangling)) {
      return [leftBrace, rightBrace, printTypeAnnotation(path, options, print)];
    }

    content = group([
      leftBrace,
      printDanglingComments(path, options),
      softline,
      rightBrace,
      printOptionalToken(path),
      printTypeAnnotation(path, options, print),
    ]);
  } else {
    content = [
      isFlowInterfaceLikeBody && isNonEmptyArray(n.properties)
        ? printHardlineAfterHeritage(parent)
        : "",
      leftBrace,
      indent([options.bracketSpacing ? line : softline, ...props]),
      ifBreak(
        canHaveTrailingSeparator &&
          (separator !== "," || shouldPrintComma(options))
          ? separator
          : ""
      ),
      options.bracketSpacing ? line : softline,
      rightBrace,
      printOptionalToken(path),
      printTypeAnnotation(path, options, print),
    ];
  }

  // If we inline the object as first argument of the parent, we don't want
  // to create another group so that the object breaks before the return
  // type
  if (
    path.match(
      (node) => node.type === "ObjectPattern" && !node.decorators,
      (node, name, number) =>
        shouldHugFunctionParameters(node) &&
        (name === "params" ||
          name === "parameters" ||
          name === "this" ||
          name === "rest") &&
        number === 0
    ) ||
    path.match(
      shouldHugType,
      (node, name) => name === "typeAnnotation",
      (node, name) => name === "typeAnnotation",
      (node, name, number) =>
        shouldHugFunctionParameters(node) &&
        (name === "params" ||
          name === "parameters" ||
          name === "this" ||
          name === "rest") &&
        number === 0
    )
  ) {
    return content;
  }

  return group(content, { shouldBreak });
}

module.exports = { printObject };
