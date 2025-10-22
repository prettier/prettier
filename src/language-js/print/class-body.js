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
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  getComments,
  hasComment,
  isNextLineEmpty,
  shouldPrintComma,
} from "../utils/index.js";
import { shouldHugTheOnlyParameter } from "./function-parameters.js";

const isClassMember = createTypeCheckFunction([
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);

/*
- `ClassBody`
- `TSInterfaceBody` (TypeScript)
- `TSTypeLiteral` (TypeScript)
- `ObjectTypeAnnotation` (Flow)
*/
function printClassBody(path, options, print) {
  const { node } = path;
  const parts = [];
  const isFlowTypeAnnotation = node.type === "ObjectTypeAnnotation";
  const isObjectType = !isClassBody(path);
  const separator = isObjectType ? line : hardline;

  const [openingBrace, closingBrace] =
    isFlowTypeAnnotation && node.exact ? ["{|", "|}"] : "{}";
  let firstMember;

  iterateClassMembers(path, ({ node, next, isLast }) => {
    firstMember ??= node;
    parts.push(print());

    if (isObjectType && isFlowTypeAnnotation) {
      const { parent } = path;

      if (parent.inexact || !isLast) {
        parts.push(",");
      } else if (shouldPrintComma(options)) {
        parts.push(ifBreak(","));
      }
    }

    if (shouldPrintSemicolonAfterClassMember({ node, next }, options)) {
      parts.push(";");
    }

    if (!isLast) {
      parts.push(separator);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  });

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(printDanglingComments(path, options));
  }

  if (node.type === "ObjectTypeAnnotation" && node.inexact) {
    let printed;
    if (hasComment(node, CommentCheckFlags.Dangling)) {
      const hasLineComments = hasComment(node, CommentCheckFlags.Line);
      printed = [
        hasLineComments ||
        hasNewline(options.originalText, locEnd(getComments(node).at(-1)))
          ? hardline
          : line,
        "...",
      ];
    } else {
      printed = [firstMember ? line : "", "..."];
    }
    parts.push(printed);
  }

  if (isObjectType) {
    const shouldBreak =
      options.objectWrap === "preserve" &&
      firstMember &&
      hasNewlineInRange(
        options.originalText,
        locStart(node),
        locStart(firstMember),
      );

    let content;
    if (parts.length === 0) {
      content = openingBrace + closingBrace;
    } else {
      const spacing = options.bracketSpacing ? line : softline;
      content = [
        openingBrace,
        indent([spacing, ...parts]),
        spacing,
        closingBrace,
      ];
    }

    // If we inline the object as first argument of the parent, we don't want
    // to create another group so that the object breaks before the return
    // type
    if (
      path.match(
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
      )
    ) {
      return content;
    }

    return group(content, { shouldBreak });
  }

  return [
    openingBrace,
    parts.length > 0 ? [indent([hardline, parts]), hardline] : "",
    closingBrace,
  ];
}

function isClassBody(path) {
  const { node } = path;

  if (node.type === "ObjectTypeAnnotation") {
    const { key, parent } = path;
    return (
      key === "body" &&
      (parent.type === "InterfaceDeclaration" ||
        parent.type === "DeclareInterface" ||
        parent.type === "DeclareClass")
    );
  }

  return node.type === "ClassBody" || node.type === "TSInterfaceBody";
}

function iterateClassMembers(path, iteratee) {
  const { node } = path;
  if (node.type === "ClassBody" || node.type === "TSInterfaceBody") {
    path.each(iteratee, "body");
    return;
  }

  if (node.type === "TSTypeLiteral") {
    path.each(iteratee, "members");
    return;
  }

  if (node.type === "ObjectTypeAnnotation") {
    // Unfortunately, things grouped together in the ast can be
    // interleaved in the source code. So we need to reorder them before
    // printing them.
    const children = [
      "properties",
      "indexers",
      "callProperties",
      "internalSlots",
    ]
      .flatMap((field) =>
        path.map(
          ({ node, index }) => ({
            node,
            loc: locStart(node),
            selector: [field, index],
          }),
          field,
        ),
      )
      .sort((a, b) => a.loc - b.loc);

    for (const [index, { node, selector }] of children.entries()) {
      path.call(
        () =>
          iteratee({
            node,
            next: children[index + 1]?.node,
            isLast: index === children.length - 1,
          }),
        ...selector,
      );
    }
  }
}

function printClassMemberSemicolon(path, options) {
  const { parent } = path;

  if (path.callParent(isClassBody)) {
    return options.semi || parent.type === "ObjectTypeAnnotation" ? ";" : "";
  }

  if (parent.type === "TSTypeLiteral") {
    return path.isLast
      ? options.semi
        ? ifBreak(";")
        : ""
      : options.semi
        ? ";"
        : ifBreak("", ";");
  }

  return "";
}

/**
 * @returns {boolean}
 */
function shouldPrintSemicolonAfterClassMember(
  { node, next: nextNode },
  options,
) {
  if (options.semi || !isClassMember(node)) {
    return false;
  }

  const { type, name } = node.key;
  if (
    !node.computed &&
    type === "Identifier" &&
    (name === "static" || name === "get" || name === "set") &&
    !node.value &&
    !node.typeAnnotation
  ) {
    return true;
  }

  if (!nextNode) {
    return false;
  }

  if (
    nextNode.static ||
    nextNode.accessibility || // TypeScript
    nextNode.readonly // TypeScript
  ) {
    return false;
  }

  if (!nextNode.computed) {
    const name = nextNode.key?.name;
    if (name === "in" || name === "instanceof") {
      return true;
    }
  }

  // Flow variance sigil +/- requires semi if there's no
  // "declare" or "static" keyword before it.
  if (
    isClassMember(nextNode) &&
    nextNode.variance &&
    !nextNode.static &&
    !nextNode.declare
  ) {
    return true;
  }

  switch (nextNode.type) {
    case "ClassProperty":
    case "PropertyDefinition":
    case "TSAbstractPropertyDefinition":
      return nextNode.computed;
    case "MethodDefinition":
    case "TSAbstractMethodDefinition":
    case "ClassMethod":
    case "ClassPrivateMethod": {
      // Babel
      const isAsync = nextNode.value ? nextNode.value.async : nextNode.async;
      if (isAsync || nextNode.kind === "get" || nextNode.kind === "set") {
        return false;
      }

      const isGenerator = nextNode.value
        ? nextNode.value.generator
        : nextNode.generator;
      if (nextNode.computed || isGenerator) {
        return true;
      }

      return false;
    }

    case "TSIndexSignature":
      return true;
  }

  /* c8 ignore next */
  return false;
}

export { printClassBody, printClassMemberSemicolon };
