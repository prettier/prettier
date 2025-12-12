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
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  hasLeadingOwnLineComment,
  isConditionalType,
  isTupleType,
  isTypeAlias,
  shouldUnionTypePrintOwnComments,
} from "../utilities/index.js";

/**
@import {Doc} from "../../document/index.js";
*/

// `TSUnionType` and `UnionTypeAnnotation`
function printUnionType(path, options, print) {
  const { node } = path;
  // single-line variation
  // A | B | C

  // multi-line variation
  // | A
  // | B
  // | C

  const { parent } = path;

  // If there's a leading comment, the parent is doing the indentation
  const shouldIndent =
    parent.type !== "TypeParameterInstantiation" &&
    (!isConditionalType(parent) || !options.experimentalTernaries) &&
    parent.type !== "TSTypeParameterInstantiation" &&
    parent.type !== "GenericTypeAnnotation" &&
    parent.type !== "TSTypeReference" &&
    parent.type !== "TSTypeAssertion" &&
    !isTupleType(parent) &&
    !(
      parent.type === "FunctionTypeParam" &&
      !parent.name &&
      path.grandparent.this !== parent
    ) &&
    !(
      (isTypeAlias(parent) || parent.type === "VariableDeclarator") &&
      hasLeadingOwnLineComment(options.originalText, node)
    ) &&
    !(
      isTypeAlias(parent) &&
      hasComment(parent.id, CommentCheckFlags.Trailing | CommentCheckFlags.Line)
    );

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

  const shouldAddStartLine =
    shouldIndent && !hasLeadingOwnLineComment(options.originalText, node);

  const mainParts = [
    ifBreak([shouldAddStartLine ? line : "", "| "]),
    join([line, "| "], printed),
  ];

  if (needsParentheses(path, options)) {
    return [leading, group([indent(mainParts), softline]), trailing];
  }

  const parts = [leading, group(mainParts)];

  if (isTupleType(parent) && parent.elementTypes.length > 1) {
    return [
      group([
        indent([ifBreak(["(", softline]), parts]),
        softline,
        ifBreak(")"),
      ]),
      trailing,
    ];
  }

  return [group(shouldIndent ? indent(parts) : parts), trailing];
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
