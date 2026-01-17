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
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  getComments,
  hasComment,
  isNextLineEmpty,
  shouldPrintComma,
} from "../utilities/index.js";
import { shouldHugTheOnlyParameter } from "./function-parameters.js";

/*
- `ClassBody`
- `TSInterfaceBody` (TypeScript)
- `TSTypeLiteral` (TypeScript)
- `ObjectTypeAnnotation` (Flow)
- `RecordDeclarationBody` (Flow)
*/
function printClassBody(path, options, print) {
  const { node } = path;
  const parts = [];
  const isFlowTypeAnnotation = node.type === "ObjectTypeAnnotation";
  const isFlowRecordDeclaration = node.type === "RecordDeclarationBody";
  const isObjectType = !isClassBody(path);
  const separator = isObjectType ? line : hardline;
  const hasDanglingComments = hasComment(node, CommentCheckFlags.Dangling);

  const [openingBrace, closingBrace] =
    isFlowTypeAnnotation && node.exact ? ["{|", "|}"] : "{}";
  let firstMember;

  iterateClassMembers(path, ({ node, next, isLast }) => {
    firstMember ??= node;
    parts.push(print());

    if (!isFlowRecordDeclaration && isObjectType && isFlowTypeAnnotation) {
      const { parent } = path;

      if (parent.inexact || !isLast) {
        parts.push(",");
      } else if (shouldPrintComma(options)) {
        parts.push(ifBreak(","));
      }
    }

    if (isFlowRecordDeclaration && node.type !== "MethodDefinition") {
      parts.push(",");
    }

    if (
      !isFlowRecordDeclaration &&
      !isObjectType &&
      (shouldPrintSemicolonAfterClassProperty({ node, next }, options) ||
        shouldPrintSemicolonAfterInterfaceProperty({ node, next }, options))
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

  if (hasDanglingComments) {
    parts.push(printDanglingComments(path, options));
  }

  // TODO: this part can unify with the similar part in `printObject`
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
      hasDanglingComments ||
      (options.objectWrap === "preserve" &&
        firstMember &&
        hasNewlineInRange(
          options.originalText,
          locStart(node),
          locStart(firstMember),
        ));

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

  return (
    node.type === "ClassBody" ||
    node.type === "TSInterfaceBody" ||
    node.type === "RecordDeclarationBody"
  );
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

  if (node.type === "RecordDeclarationBody") {
    path.each(iteratee, "elements");
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
    if (path.isLast) {
      return options.semi ? ifBreak(";") : "";
    }

    if (
      options.semi ||
      shouldPrintSemicolonAfterInterfaceProperty(
        { node: path.node, next: path.next },
        options,
      )
    ) {
      return ";";
    }

    return ifBreak("", ";");
  }

  return "";
}

const isClassProperty = createTypeCheckFunction([
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);

const isKeywordProperty = (node) => {
  if (node.computed || node.typeAnnotation) {
    return false;
  }

  const { type, name } = node.key;
  return (
    type === "Identifier" &&
    (name === "static" || name === "get" || name === "set")
  );
};

/**
 * @returns {boolean}
 */
function shouldPrintSemicolonAfterClassProperty(
  { node, next: nextNode },
  options,
) {
  if (options.semi || !isClassProperty(node)) {
    return false;
  }

  if (!node.value && isKeywordProperty(node)) {
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
    !nextNode.static &&
    // @ts-expect-error -- Safe
    nextNode.variance &&
    // @ts-expect-error -- Safe
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

  return false;
}

const isInterfaceProperty = createTypeCheckFunction(["TSPropertySignature"]);
function shouldPrintSemicolonAfterInterfaceProperty(
  { node, next: nextNode },
  options,
) {
  if (options.semi || !isInterfaceProperty(node)) {
    return false;
  }

  if (isKeywordProperty(node)) {
    return true;
  }

  if (!nextNode) {
    return false;
  }

  switch (nextNode.type) {
    case "TSCallSignatureDeclaration":
      return true;
  }

  return false;
}

export { printClassBody, printClassMemberSemicolon };
