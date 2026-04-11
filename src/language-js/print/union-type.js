import {
  align,
  group,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import { printComments } from "../../main/comments/print.js";
import needsParentheses from "../parentheses/needs-parentheses.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isFlowObjectTypePropertyAFunction } from "../utilities/is-flow-object-type-property-a-function.js";
import {
  isBinaryCastExpression,
  isConditionalType,
  isTupleType,
  isTypeParameterInstantiation,
} from "../utilities/node-types.js";
import {
  shouldHugUnionType,
  shouldUnionTypePrintOwnComments,
} from "../utilities/union-type-print.js";

/**
@import {Doc} from "../../document/index.js";
*/

// `TSUnionType` and `UnionTypeAnnotation`
function printUnionType(path, options, print, args) {
  const { node } = path;

  // {
  //   a: string
  // } | null | void
  // should be inlined and not be printed in the multi-line variant
  if (shouldHugUnionType(node)) {
    return join(" | ", path.map(print, "types"));
  }

  // single-line variation
  // A | B | C

  // multi-line variation
  // | A
  // | B
  // | C

  // We want to align the children but without its comment, so it looks like
  // | child1
  // // comment
  // | child2
  /** @type {Doc} */
  let printed = group(
    path.map(({ isFirst }) => {
      const bar = isFirst ? ifBreak("| ") : [line, "| "];
      const typeDoc = print();
      if (hasComment(path.node, CommentCheckFlags.Leading)) {
        return [bar, align(2, printComments(path, typeDoc, options))];
      }

      return [bar, printComments(path, align(2, typeDoc), options)];
    }, "types"),
  );

  if (shouldUnionTypePrintOwnComments(path)) {
    printed = printComments(path, printed, options);
  }

  if (needsParentheses(path, options)) {
    return group([indent([softline, printed]), softline]);
  }

  const { key, parent } = path;
  if (
    key === "elementTypes" &&
    isTupleType(parent) &&
    parent.elementTypes.length > 1
  ) {
    return group([
      indent([ifBreak(["(", softline]), printed]),
      softline,
      ifBreak(")"),
    ]);
  }

  // Already indent in parent
  if (
    args?.assignmentLayout === "break-after-operator" ||
    !shouldIndentUnionType(path)
  ) {
    return printed;
  }

  return group(indent([softline, printed]));
}

function shouldIndentUnionType(path) {
  const { key, parent } = path;
  if (
    (key === "typeAnnotation" && parent.type === "TSTypeAssertion") ||
    (key === "typeAnnotation" && isBinaryCastExpression(parent)) ||
    (key === "elementTypes" && isTupleType(parent)) ||
    ((key === "trueType" || key === "falseType") &&
      isConditionalType(parent)) ||
    (key === "params" && isTypeParameterInstantiation(parent))
  ) {
    return false;
  }

  if (
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

export { printUnionType, shouldHugUnionType };
