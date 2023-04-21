import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import createGroupIdMapper from "../../utils/create-group-id-mapper.js";
import { printDanglingComments } from "../../main/comments/print.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  indent,
  ifBreak,
} from "../../document/builders.js";
import {
  hasComment,
  CommentCheckFlags,
  createTypeCheckFunction,
  isNextLineEmpty,
} from "../utils/index.js";
import { getTypeParametersGroupId } from "./type-parameters.js";
import { printMethod } from "./function.js";
import {
  printOptionalToken,
  printDefiniteToken,
  printDeclareToken,
  printAbstractToken,
  printTypeScriptAccessibilityToken,
} from "./misc.js";
import { printPropertyKey } from "./property.js";
import { printAssignment } from "./assignment.js";
import { printClassMemberDecorators } from "./decorators.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

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
- `ClassDeclaration`
- `ClassExpression`
- `DeclareClass`(flow)
*/
function printClass(path, options, print) {
  const { node } = path;
  /** @type {Doc[]} */
  const parts = [printDeclareToken(path), printAbstractToken(path), "class"];

  const partsGroup = [
    ...(node.id ? [" ", print("id")] : []),
    print("typeParameters"),
  ];

  const extendsParts = [
    "superClass",
    "extends",
    "mixins",
    "implements",
  ].flatMap((property) => printHeritageClauses(path, options, print, property));

  let printedPartsGroup;
  if (shouldIndentOnlyHeritageClauses(node)) {
    printedPartsGroup = [...partsGroup, indent(extendsParts)];
  } else {
    printedPartsGroup = indent([...partsGroup, extendsParts]);
  }

  parts.push(
    group(printedPartsGroup, { id: getHeritageGroupId(node) }),
    " ",
    print("body")
  );

  return parts;
}

const getHeritageGroupId = createGroupIdMapper("heritageGroup");

function printHardlineAfterHeritage(node) {
  return ifBreak(hardline, "", { groupId: getHeritageGroupId(node) });
}

function hasMultipleHeritage(node) {
  return (
    ["extends", "mixins", "implements"].reduce(
      (count, key) => count + (Array.isArray(node[key]) ? 1 : 0),
      node.superClass ? 1 : 0
    ) > 1
  );
}

function shouldIndentOnlyHeritageClauses(node) {
  return (
    node.typeParameters &&
    !hasComment(
      node.typeParameters,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line
    ) &&
    !hasMultipleHeritage(node)
  );
}

function printHeritageClauses(path, options, print, listName) {
  const { node } = path;

  // superClass is a single node
  if (
    (listName === "superClass" && !node.superClass) ||
    (listName !== "superClass" && !isNonEmptyArray(node[listName]))
  ) {
    return "";
  }

  const printed =
    listName === "superClass"
      ? printSuperClass(path, options, print)
      : join([",", line], path.map(print, listName));

  const printedLeadingComments = printDanglingComments(path, options, {
    marker: listName,
  });
  return [
    shouldIndentOnlyHeritageClauses(node)
      ? ifBreak(" ", line, {
          groupId: getTypeParametersGroupId(node.typeParameters),
        })
      : line,
    printedLeadingComments,
    printedLeadingComments && hardline,
    listName === "superClass" ? "extends" : listName,
    group(indent([line, printed])),
  ];
}

function printSuperClass(path, options, print) {
  let printed = print("superClass");

  if (path.parent.type === "AssignmentExpression") {
    printed = group(
      ifBreak(["(", indent([softline, printed]), softline, ")"], printed)
    );
  }

  return [printed, print("superTypeParameters")];
}

function printClassMethod(path, options, print) {
  const { node } = path;
  const parts = [];

  if (isNonEmptyArray(node.decorators)) {
    parts.push(printClassMemberDecorators(path, options, print));
  }

  parts.push(printTypeScriptAccessibilityToken(node));

  if (node.static) {
    parts.push("static ");
  }

  parts.push(printAbstractToken(path));

  if (node.override) {
    parts.push("override ");
  }

  parts.push(printMethod(path, options, print));

  return parts;
}

function printClassProperty(path, options, print) {
  const { node } = path;
  const parts = [];
  const semi = options.semi ? ";" : "";

  if (isNonEmptyArray(node.decorators)) {
    parts.push(printClassMemberDecorators(path, options, print));
  }

  parts.push(printTypeScriptAccessibilityToken(node), printDeclareToken(path));

  if (node.static) {
    parts.push("static ");
  }

  parts.push(printAbstractToken(path));

  if (node.override) {
    parts.push("override ");
  }
  if (node.readonly) {
    parts.push("readonly ");
  }
  if (node.variance) {
    parts.push(print("variance"));
  }
  if (
    node.type === "ClassAccessorProperty" ||
    node.type === "AccessorProperty" ||
    node.type === "TSAbstractAccessorProperty"
  ) {
    parts.push("accessor ");
  }
  parts.push(
    printPropertyKey(path, options, print),
    printOptionalToken(path),
    printDefiniteToken(path),
    printTypeAnnotationProperty(path, print)
  );

  const isAbstractProperty =
    node.type === "TSAbstractPropertyDefinition" ||
    node.type === "TSAbstractAccessorProperty";

  return [
    printAssignment(
      path,
      options,
      print,
      parts,
      " =",
      isAbstractProperty ? undefined : "value"
    ),
    semi,
  ];
}

function printClassBody(path, options, print) {
  const { node } = path;
  const parts = [];

  path.each(({ node, next, isLast }) => {
    parts.push(print());

    if (
      !options.semi &&
      isClassProperty(node) &&
      shouldPrintSemicolonAfterClassProperty(node, next)
    ) {
      parts.push(";");
    }

    if (!isLast) {
      parts.push(hardline);

      if (isNextLineEmpty(node, options)) {
        parts.push(hardline);
      }
    }
  }, "body");

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(printDanglingComments(path, options));
  }

  return [
    isNonEmptyArray(node.body) ? printHardlineAfterHeritage(path.parent) : "",
    "{",
    parts.length > 0 ? [indent([hardline, parts]), hardline] : "",
    "}",
  ];
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
    nextNode.accessibility // TypeScript
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

export {
  printClass,
  printClassMethod,
  printClassProperty,
  printHardlineAfterHeritage,
  printClassBody,
};
