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

const isClassProperty = createTypeCheckFunction([
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
  const isObject = !isClassBody(path);
  const separator = isObject ? line : hardline;

  const isFlowTypeAnnotation = node.type === "ObjectTypeAnnotation";
  const [openingBrace, closingBrace] =
    isFlowTypeAnnotation && node.exact ? ["{|", "|}"] : "{}";
  let firstProperty;

  iterateClassMembers(path, ({ node, next, isLast }) => {
    firstProperty ??= node;
    parts.push(print());

    if (isObject && isFlowTypeAnnotation) {
      const { parent } = path;

      if (parent.inexact || !isLast) {
        parts.push(",");
      } else if (shouldPrintComma(options)) {
        parts.push(ifBreak(","));
      }
    }

    if (
      !options.semi &&
      isClassProperty(node) &&
      shouldPrintSemicolonAfterClassProperty(node, next)
    ) {
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
      printed = [firstProperty ? line : "", "..."];
    }
    parts.push(printed);
  }

  if (isObject) {
    const shouldBreak =
      options.objectWrap === "preserve" &&
      firstProperty &&
      hasNewlineInRange(
        options.originalText,
        locStart(node),
        locStart(firstProperty),
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
  const { parent, node } = path;
  const members = path.callParent(getObjectTypeAnnotationMembers);

  if (members.includes(node)) {
    if (path.callParent(isClassBody)) {
      const isFlowTypeAnnotation = path.callParent(
        ({ node }) => node.type === "ObjectTypeAnnotation",
      );
      return isFlowTypeAnnotation || options.semi ? ";" : "";
    }

    if (parent.type === "TSTypeLiteral") {
      return node === members.at(-1)
        ? options.semi
          ? ifBreak(";")
          : ""
        : options.semi
          ? ";"
          : ifBreak("", ";");
    }
  }

  return "";
}

function getObjectTypeAnnotationMembers(path) {
  const members = [];
  iterateClassMembers(path, ({ node }) => {
    members.push(node);
  });
  return members;
}

/**
 * @returns {boolean}
 */
function shouldPrintSemicolonAfterClassProperty(node, nextNode) {
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
    isClassProperty(nextNode) &&
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
