import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import {
  printComments,
  printDanglingComments,
} from "../../main/comments/print.js";
import createGroupIdMapper from "../../utils/create-group-id-mapper.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  isNextLineEmpty,
} from "../utils/index.js";
import { printAssignment } from "./assignment.js";
import { printClassMemberDecorators } from "./decorators.js";
import { printMethod } from "./function.js";
import {
  printAbstractToken,
  printDeclareToken,
  printDefiniteToken,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./misc.js";
import { printPropertyKey } from "./property.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";
import { getTypeParametersGroupId } from "./type-parameters.js";

/**
 * @import {Doc} from "../../document/builders.js"
 */

const getHeritageGroupId = createGroupIdMapper("heritageGroup");

const isClassProperty = createTypeCheckFunction([
  "ClassProperty",
  "PropertyDefinition",
  "ClassPrivateProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractPropertyDefinition",
  "TSAbstractAccessorProperty",
]);

const isInterface = createTypeCheckFunction([
  "TSInterfaceDeclaration",
  "DeclareInterface",
  "InterfaceDeclaration",
  "InterfaceTypeAnnotation",
]);

/*
- `ClassDeclaration`
- `ClassExpression`
- `DeclareClass`(flow)
- `DeclareInterface`(flow)
- `InterfaceDeclaration`(flow)
- `InterfaceTypeAnnotation`(flow)
- `TSInterfaceDeclaration`(TypeScript)
*/
function printClass(path, options, print) {
  const { node } = path;
  const isPrintingInterface = isInterface(node);

  /** @type {Doc[]} */
  const parts = [
    printDeclareToken(path),
    printAbstractToken(path),
    isPrintingInterface ? "interface" : "class",
  ];

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    hasComment(node.id, CommentCheckFlags.Trailing) ||
    hasComment(node.typeParameters, CommentCheckFlags.Trailing) ||
    hasComment(node.superClass) ||
    isNonEmptyArray(node.extends) ||
    isNonEmptyArray(node.mixins) ||
    isNonEmptyArray(node.implements);

  const partsGroup = [];
  const extendsParts = [];

  if (node.type !== "InterfaceTypeAnnotation") {
    if (node.id) {
      partsGroup.push(" ", print("id"));
    }

    partsGroup.push(print("typeParameters"));
  }

  if (node.superClass) {
    const printed = [
      printSuperClass(path, options, print),
      print(
        // TODO: Remove `superTypeParameters` when https://github.com/facebook/hermes/issues/1808#issuecomment-3413004377 get fixed
        node.superTypeArguments ? "superTypeArguments" : "superTypeParameters",
      ),
    ];
    const printedWithComments = path.call(
      () => ["extends ", printComments(path, printed, options)],
      "superClass",
    );
    if (groupMode) {
      extendsParts.push(line, group(printedWithComments));
    } else {
      extendsParts.push(" ", printedWithComments);
    }
  } else {
    extendsParts.push(printHeritageClauses(path, options, print, "extends"));
  }

  extendsParts.push(
    printHeritageClauses(path, options, print, "mixins"),
    printHeritageClauses(path, options, print, "implements"),
  );

  let heritageGroupId;
  if (groupMode) {
    heritageGroupId = getHeritageGroupId(node);
    parts.push(
      group([...partsGroup, indent(extendsParts)], { id: heritageGroupId }),
    );
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  /*
  To improve visual separation between class head and body https://github.com/prettier/prettier/issues/10018
  we introduced https://github.com/prettier/prettier/pull/10085
  However, users complaint.
  We decide to defer to solve the inconsistency to a major release (V4)
  Meanwhile, we are not going to put the `{` of interface body on a new line
  https://github.com/prettier/prettier/issues/18115
  */
  if (!isPrintingInterface && groupMode && isNonEmptyClassBody(node.body)) {
    parts.push(ifBreak(hardline, " ", { groupId: heritageGroupId }));
  } else {
    parts.push(" ");
  }

  parts.push(print("body"));

  return parts;
}

function isNonEmptyClassBody(node) {
  return node.type === "ObjectTypeAnnotation"
    ? ["properties", "indexers", "callProperties", "internalSlots"].some(
        (property) => isNonEmptyArray(node[property]),
      )
    : isNonEmptyArray(node.body);
}

function hasMultipleHeritage(node) {
  return (
    ["extends", "mixins", "implements"].reduce(
      (count, key) => count + (Array.isArray(node[key]) ? node[key].length : 0),
      node.superClass ? 1 : 0,
    ) > 1
  );
}

function shouldIndentOnlyHeritageClauses(node) {
  return (
    node.typeParameters &&
    !hasComment(
      node.typeParameters,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line,
    ) &&
    !hasMultipleHeritage(node)
  );
}

function printHeritageClauses(path, options, print, listName) {
  const { node } = path;
  if (!isNonEmptyArray(node[listName])) {
    return "";
  }

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
    listName,
    group(indent([line, join([",", line], path.map(print, listName))])),
  ];
}

function printSuperClass(path, options, print) {
  const printed = print("superClass");
  const { parent } = path;
  if (parent.type === "AssignmentExpression") {
    return group(
      ifBreak(["(", indent([softline, printed]), softline, ")"], printed),
    );
  }
  return printed;
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

/*
- `ClassProperty`
- `PropertyDefinition`
- `ClassPrivateProperty`
- `ClassAccessorProperty`
- `AccessorProperty`
- `TSAbstractAccessorProperty` (TypeScript)
- `TSAbstractPropertyDefinition` (TypeScript)
*/
function printClassProperty(path, options, print) {
  const { node } = path;
  const parts = [];

  if (isNonEmptyArray(node.decorators)) {
    parts.push(printClassMemberDecorators(path, options, print));
  }

  parts.push(printDeclareToken(path), printTypeScriptAccessibilityToken(node));

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
    printTypeAnnotationProperty(path, print),
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
      isAbstractProperty ? undefined : "value",
    ),
    options.semi ? ";" : "",
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

export { printClass, printClassBody, printClassMethod, printClassProperty };
