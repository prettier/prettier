import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utils/has-newline.js";
import hasNewlineInRange from "../../utils/has-newline-in-range.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  getComments,
  hasComment,
  isNextLineEmpty,
  isObjectType,
  shouldPrintComma,
} from "../utils/index.js";
import { printHardlineAfterHeritage } from "./class.js";
import { shouldHugTheOnlyFunctionParameter } from "./function-parameters.js";
import { printOptionalToken } from "./misc.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

function printObject(path, options, print) {
  const semi = options.semi ? ";" : "";
  const { node } = path;

  const isTypeAnnotation = node.type === "ObjectTypeAnnotation";
  const isEnumBody =
    node.type === "TSEnumDeclaration" ||
    node.type === "EnumBooleanBody" ||
    node.type === "EnumNumberBody" ||
    node.type === "EnumBigIntBody" ||
    node.type === "EnumStringBody" ||
    node.type === "EnumSymbolBody";
  const fields = [
    node.type === "TSTypeLiteral" || isEnumBody
      ? "members"
      : node.type === "TSInterfaceBody"
        ? "body"
        : "properties",
  ];
  if (isTypeAnnotation) {
    fields.push("indexers", "callProperties", "internalSlots");
  }

  // Unfortunately, things grouped together in the ast can be
  // interleaved in the source code. So we need to reorder them before
  // printing them.
  const propsAndLoc = fields.flatMap((field) =>
    path.map(
      ({ node }) => ({
        node,
        printed: print(),
        loc: locStart(node),
      }),
      field,
    ),
  );

  if (fields.length > 1) {
    propsAndLoc.sort((a, b) => a.loc - b.loc);
  }

  const { parent, key } = path;
  const isFlowInterfaceLikeBody =
    isTypeAnnotation &&
    key === "body" &&
    (parent.type === "InterfaceDeclaration" ||
      parent.type === "DeclareInterface" ||
      parent.type === "DeclareClass");
  const shouldBreak =
    node.type === "TSInterfaceBody" ||
    isEnumBody ||
    isFlowInterfaceLikeBody ||
    (node.type === "ObjectPattern" &&
      parent.type !== "FunctionDeclaration" &&
      parent.type !== "FunctionExpression" &&
      parent.type !== "ArrowFunctionExpression" &&
      parent.type !== "ObjectMethod" &&
      parent.type !== "ClassMethod" &&
      parent.type !== "ClassPrivateMethod" &&
      parent.type !== "AssignmentPattern" &&
      parent.type !== "CatchClause" &&
      node.properties.some(
        (property) =>
          property.value &&
          (property.value.type === "ObjectPattern" ||
            property.value.type === "ArrayPattern"),
      )) ||
    (node.type !== "ObjectPattern" &&
      propsAndLoc.length > 0 &&
      hasNewlineInRange(
        options.originalText,
        locStart(node),
        propsAndLoc[0].loc,
      ));

  const separator = isFlowInterfaceLikeBody
    ? ";"
    : node.type === "TSInterfaceBody" || node.type === "TSTypeLiteral"
      ? ifBreak(semi, ";")
      : ",";
  const leftBrace =
    node.type === "RecordExpression" ? "#{" : node.exact ? "{|" : "{";
  const rightBrace = node.exact ? "|}" : "}";

  /** @type {Doc[]} */
  let separatorParts = [];
  const props = propsAndLoc.map((prop) => {
    const result = [...separatorParts, group(prop.printed)];
    separatorParts = [separator, line];
    if (
      (prop.node.type === "TSPropertySignature" ||
        prop.node.type === "TSMethodSignature" ||
        prop.node.type === "TSConstructSignatureDeclaration" ||
        prop.node.type === "TSCallSignatureDeclaration") &&
      hasComment(prop.node, CommentCheckFlags.PrettierIgnore)
    ) {
      separatorParts.shift();
    }
    if (isNextLineEmpty(prop.node, options)) {
      separatorParts.push(hardline);
    }
    return result;
  });

  if (node.inexact || node.hasUnknownMembers) {
    let printed;
    if (hasComment(node, CommentCheckFlags.Dangling)) {
      const hasLineComments = hasComment(node, CommentCheckFlags.Line);
      const printedDanglingComments = printDanglingComments(path, options);
      printed = [
        printedDanglingComments,
        hasLineComments ||
        hasNewline(options.originalText, locEnd(getComments(node).at(-1)))
          ? hardline
          : line,
        "...",
      ];
    } else {
      printed = ["..."];
    }
    props.push([...separatorParts, ...printed]);
  }

  const lastElem = propsAndLoc.at(-1)?.node;

  const canHaveTrailingSeparator = !(
    node.inexact ||
    node.hasUnknownMembers ||
    (lastElem &&
      (lastElem.type === "RestElement" ||
        ((lastElem.type === "TSPropertySignature" ||
          lastElem.type === "TSCallSignatureDeclaration" ||
          lastElem.type === "TSMethodSignature" ||
          lastElem.type === "TSConstructSignatureDeclaration") &&
          hasComment(lastElem, CommentCheckFlags.PrettierIgnore))))
  );

  let content;
  if (props.length === 0) {
    if (!hasComment(node, CommentCheckFlags.Dangling)) {
      return [leftBrace, rightBrace, printTypeAnnotationProperty(path, print)];
    }

    content = group([
      leftBrace,
      printDanglingComments(path, options, { indent: true }),
      softline,
      rightBrace,
      printOptionalToken(path),
      printTypeAnnotationProperty(path, print),
    ]);
  } else {
    content = [
      isFlowInterfaceLikeBody && isNonEmptyArray(node.properties)
        ? printHardlineAfterHeritage(parent)
        : "",
      leftBrace,
      indent([options.bracketSpacing ? line : softline, ...props]),
      ifBreak(
        canHaveTrailingSeparator &&
          (separator !== "," || shouldPrintComma(options))
          ? separator
          : "",
      ),
      options.bracketSpacing ? line : softline,
      rightBrace,
      printOptionalToken(path),
      printTypeAnnotationProperty(path, print),
    ];
  }

  // If we inline the object as first argument of the parent, we don't want
  // to create another group so that the object breaks before the return
  // type
  if (
    path.match(
      (node) =>
        node.type === "ObjectPattern" && !isNonEmptyArray(node.decorators),
      shouldHugTheOnlyParameter,
    ) ||
    (isObjectType(node) &&
      (path.match(
        undefined,
        (node, name) => name === "typeAnnotation",
        (node, name) => name === "typeAnnotation",
        shouldHugTheOnlyParameter,
      ) ||
        path.match(
          undefined,
          (node, name) =>
            node.type === "FunctionTypeParam" && name === "typeAnnotation",
          shouldHugTheOnlyParameter,
        ))) ||
    // Assignment printing logic (printAssignment) is responsible
    // for adding a group if needed
    (!shouldBreak &&
      path.match(
        (node) => node.type === "ObjectPattern",
        (node) =>
          node.type === "AssignmentExpression" ||
          node.type === "VariableDeclarator",
      ))
  ) {
    return content;
  }

  return group(content, { shouldBreak });
}

function shouldHugTheOnlyParameter(node, name) {
  return (
    (name === "params" ||
      name === "parameters" ||
      name === "this" ||
      name === "rest") &&
    shouldHugTheOnlyFunctionParameter(node)
  );
}

export { printObject };
