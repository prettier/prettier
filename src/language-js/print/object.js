import * as assert from "#universal/assert";
import {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utilities/has-newline.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import getTextWithoutComments from "../utilities/get-text-without-comments.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  getComments,
  hasComment,
  isNextLineEmpty,
  isObjectType,
  shouldPrintComma,
} from "../utilities/index.js";
import { shouldHugTheOnlyParameter } from "./function-parameters.js";
import {
  printDanglingCommentsInList,
  printOptionalToken,
} from "./miscellaneous.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import {Doc} from "../../document/index.js" */

const isPrintingImportAttributes = createTypeCheckFunction([
  "ImportDeclaration",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExportAllDeclaration",
  "DeclareExportDeclaration",
  "DeclareExportAllDeclaration",
]);

const isPrintingFlowEnumBody = createTypeCheckFunction([
  "EnumBooleanBody",
  "EnumNumberBody",
  "EnumBigIntBody",
  "EnumStringBody",
  "EnumSymbolBody",
]);

/*
- `ObjectExpression`
- `ObjectPattern`
- `ImportDeclaration`
- `ExportDefaultDeclaration`
- `ExportNamedDeclaration`
- `ExportAllDeclaration`
- `EnumBooleanBody` (Flow)
- `EnumNumberBody` (Flow)
- `EnumBigIntBody` (Flow)
- `EnumStringBody` (Flow)
- `EnumSymbolBody` (Flow)
- `DeclareExportDeclaration` (Flow)
- `DeclareExportAllDeclaration` (Flow)
- `TSEnumDeclaration`(TypeScript)
*/
function printObject(path, options, print) {
  const { node, parent } = path;

  const isFlowEnumBody = isPrintingFlowEnumBody(node);
  const isEnumBody = node.type === "TSEnumBody" || isFlowEnumBody;
  const isImportAttributes = isPrintingImportAttributes(node);
  const hasUnknownMembers = isFlowEnumBody && node.hasUnknownMembers;

  const property = isEnumBody
    ? "members"
    : isImportAttributes
      ? "attributes"
      : "properties";
  const children = node[property];

  const shouldBreak =
    isEnumBody ||
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
      options.objectWrap === "preserve" &&
      children.length > 0 &&
      hasNewLineAfterOpeningBrace(node, children[0], options));

  /** @type {Doc[]} */
  let separatorParts = [];
  const parts = path.map(({ node }) => {
    const result = [...separatorParts, group(print())];
    separatorParts = [",", line];
    if (isNextLineEmpty(node, options)) {
      separatorParts.push(hardline);
    }
    return result;
  }, property);

  if (hasUnknownMembers) {
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
    parts.push([...separatorParts, ...printed]);
  }

  const canHaveTrailingSeparator = !(
    hasUnknownMembers || children.at(-1)?.type === "RestElement"
  );

  let content;
  if (parts.length === 0) {
    content = group([
      "{",
      printDanglingCommentsInList(path, options),
      "}",
      printOptionalToken(path),
      printTypeAnnotationProperty(path, print),
    ]);
  } else {
    const spacing = options.bracketSpacing ? line : softline;
    content = [
      "{",
      indent([spacing, ...parts]),
      ifBreak(canHaveTrailingSeparator && shouldPrintComma(options) ? "," : ""),
      spacing,
      "}",
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

function hasNewLineAfterOpeningBrace(node, firstProperty, options) {
  const text = options.originalText;
  let openingBraceIndex = locStart(node);
  const firstPropertyStart = locStart(firstProperty);

  if (isPrintingImportAttributes(node)) {
    const start = locStart(node);
    const textBeforeAttributes = getTextWithoutComments(
      options,
      start,
      firstPropertyStart,
    );
    openingBraceIndex = start + textBeforeAttributes.lastIndexOf("{");
  }

  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.equal(text.charAt(openingBraceIndex), "{");
  }

  return hasNewlineInRange(text, openingBraceIndex, firstPropertyStart);
}

export { printObject };
