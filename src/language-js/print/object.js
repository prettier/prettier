import { printDanglingComments } from "../../main/comments.js";
import {
  line,
  softline,
  group,
  indent,
  ifBreak,
  hardline,
} from "../../document/builders.js";
import {
  getLast,
  hasNewlineInRange,
  hasNewline,
  isNonEmptyArray,
} from "../../common/util.js";
import {
  shouldPrintComma,
  hasComment,
  getComments,
  CommentCheckFlags,
  isNextLineEmpty,
  isObjectType,
} from "../utils/index.js";
import { locStart, locEnd } from "../loc.js";

import { printOptionalToken, printTypeAnnotation } from "./misc.js";
import { shouldHugTheOnlyFunctionParameter } from "./function-parameters.js";
import { printHardlineAfterHeritage } from "./class.js";

/** @typedef {import("../../document/builders.js").Doc} Doc */

function printObject(path, options, print) {
  const semi = options.semi ? ";" : "";
  const node = path.getValue();

  const isTypeAnnotation = node.type === "ObjectTypeAnnotation";
  const fields = [
    node.type === "TSTypeLiteral"
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
    path.map((childPath) => {
      const node = childPath.getValue();
      return {
        node,
        printed: print(),
        loc: locStart(node),
      };
    }, field)
  );

  if (fields.length > 1) {
    propsAndLoc.sort((a, b) => a.loc - b.loc);
  }

  const parent = path.getParentNode(0);
  const isFlowInterfaceLikeBody =
    isTypeAnnotation &&
    parent &&
    (parent.type === "InterfaceDeclaration" ||
      parent.type === "DeclareInterface" ||
      parent.type === "DeclareClass") &&
    path.getName() === "body";
  const shouldBreak =
    node.type === "TSInterfaceBody" ||
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
            property.value.type === "ArrayPattern")
      )) ||
    (node.type !== "ObjectPattern" &&
      propsAndLoc.length > 0 &&
      hasNewlineInRange(
        options.originalText,
        locStart(node),
        propsAndLoc[0].loc
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

  if (node.inexact) {
    let printed;
    if (hasComment(node, CommentCheckFlags.Dangling)) {
      const hasLineComments = hasComment(node, CommentCheckFlags.Line);
      const printedDanglingComments = printDanglingComments(
        path,
        options,
        /* sameIndent */ true
      );
      printed = [
        printedDanglingComments,
        hasLineComments ||
        hasNewline(options.originalText, locEnd(getLast(getComments(node))))
          ? hardline
          : line,
        "...",
      ];
    } else {
      printed = ["..."];
    }
    props.push([...separatorParts, ...printed]);
  }

  const lastElem = getLast(propsAndLoc)?.node;

  const canHaveTrailingSeparator = !(
    node.inexact ||
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
      isFlowInterfaceLikeBody && isNonEmptyArray(node.properties)
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
      shouldHugTheOnlyParameter
    ) ||
    (isObjectType(node) &&
      (path.match(
        undefined,
        (node, name) => name === "typeAnnotation",
        (node, name) => name === "typeAnnotation",
        shouldHugTheOnlyParameter
      ) ||
        path.match(
          undefined,
          (node, name) =>
            node.type === "FunctionTypeParam" && name === "typeAnnotation",
          shouldHugTheOnlyParameter
        ))) ||
    // Assignment printing logic (printAssignment) is responsible
    // for adding a group if needed
    (!shouldBreak &&
      path.match(
        (node) => node.type === "ObjectPattern",
        (node) =>
          node.type === "AssignmentExpression" ||
          node.type === "VariableDeclarator"
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
