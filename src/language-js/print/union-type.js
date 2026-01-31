import {
  align,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import {
  printComments,
  printCommentsSeparately,
} from "../../main/comments/print.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { hasComment } from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import { isFlowObjectTypePropertyAFunction } from "../utilities/is-flow-object-type-property-a-function.js";
import {
  isConditionalType,
  isTupleType,
  isTypeParameterInstantiation,
} from "../utilities/node-types.js";
import { shouldUnionTypePrintOwnComments } from "../utilities/should-union-type-print-own-comments.js";

/**
@import {Doc} from "../../document/index.js";
*/

// `TSUnionType` and `UnionTypeAnnotation`
function printUnionType(path, options, print, args) {
  const { node } = path;
  // single-line variation
  // A | B | C

  // multi-line variation
  // | A
  // | B
  // | C

  const { parent } = path;

  // {
  //   a: string
  // } | null | void
  // should be inlined and not be printed in the multi-line variant
  const shouldHug = shouldHugUnionType(node);

  // We want to align the children but without its comment, so it looks like
  // | child1
  // // comment
  // | child2
  const printed = path.map(() => {
    let printedType = print();
    if (!shouldHug) {
      printedType = align(2, printedType);
    }

    return printComments(path, printedType, options);
  }, "types");

  /** @type {Doc} */
  let leading = "";
  /** @type {Doc} */
  let trailing = "";
  if (shouldUnionTypePrintOwnComments(path)) {
    ({ leading, trailing } = printCommentsSeparately(path, options));
  }

  if (shouldHug) {
    return [leading, join(" | ", printed), trailing];
  }

  const mainParts = [
    leading,
    group([ifBreak("| "), join([line, "| "], printed)]),
    trailing,
  ];

  if (needsParentheses(path, options)) {
    return group([indent([softline, mainParts]), softline]);
  }

  if (isTupleType(parent) && parent.elementTypes.length > 1) {
    return [
      group([
        indent([ifBreak(["(", softline]), mainParts]),
        softline,
        ifBreak(")"),
      ]),
    ];
  }

  // Already indent in parent
  if (
    args?.assignmentLayout === "break-after-operator" ||
    !shouldIndentUnionType(path)
  ) {
    return mainParts;
  }

  return group(indent([softline, mainParts]));
}

function shouldIndentUnionType(path) {
  if (
    path.match(
      undefined,
      (node, key) =>
        key === "typeAnnotation" && node.type === "TSTypeAssertion",
    ) ||
    path.match(
      undefined,
      (node, key) => key === "elementTypes" && isTupleType(node),
    ) ||
    path.match(
      undefined,
      (node, key) =>
        (key === "trueType" || key === "falseType") && isConditionalType(node),
    ) ||
    path.match(
      undefined,
      (node, key) => key === "params" && isTypeParameterInstantiation(node),
    ) ||
    path.match(
      undefined,
      (node, key) =>
        key === "typeAnnotation" && node.type === "FunctionTypeParam",
      (node, key) => key === "params" && node.type === "FunctionTypeAnnotation",
      (node, key) =>
        key === "value" &&
        node.type === "ObjectTypeProperty" &&
        isFlowObjectTypePropertyAFunction(node),
    )
  ) {
    return false;
  }

  return true;
}

const isVoidType = createTypeCheckFunction([
  "VoidTypeAnnotation",
  "TSVoidKeyword",
  "NullLiteralTypeAnnotation",
  "TSNullKeyword",
]);

const isObjectLikeType = createTypeCheckFunction([
  "ObjectTypeAnnotation",
  "TSTypeLiteral",
  // This is a bit aggressive but captures Array<{x}>
  "GenericTypeAnnotation",
  "TSTypeReference",
]);

function shouldHugUnionType(node) {
  const { types } = node;
  if (types.some((node) => hasComment(node))) {
    return false;
  }

  const objectType = types.find((node) => isObjectLikeType(node));
  if (!objectType) {
    return false;
  }

  return types.every((node) => node === objectType || isVoidType(node));
}

export { printUnionType, shouldHugUnionType };
