import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/index.js";
import {
  printComments,
  printCommentsSeparately,
  printDanglingComments,
} from "../../main/comments/print.js";
import createGroupIdMapper from "../../utilities/create-group-id-mapper.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  isMemberExpression,
} from "../utilities/index.js";
import { printAssignment } from "./assignment.js";
import { printClassMemberDecorators } from "./decorators.js";
import { printMethod } from "./function.js";
import {
  printAbstractToken,
  printDeclareToken,
  printDefiniteToken,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printPropertyKey } from "./property.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

const getHeritageGroupId = createGroupIdMapper("heritageGroup");

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
- `RecordDeclaration`(flow)
- `TSInterfaceDeclaration`(TypeScript)
*/
function printClass(path, options, print) {
  const { node } = path;
  const isPrintingInterface = isInterface(node);
  const isPrintingRecord = node.type === "RecordDeclaration";

  const keyword = isPrintingInterface
    ? "interface"
    : isPrintingRecord
      ? "record"
      : "class";

  /** @type {Doc[]} */
  const parts = [printDeclareToken(path), printAbstractToken(path), keyword];

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode = shouldPrintClassInGroupMode(path);

  const partsGroup = [];
  const extendsParts = [];

  if (node.type !== "InterfaceTypeAnnotation") {
    if (node.id) {
      partsGroup.push(" ");
    }

    for (const property of ["id", "typeParameters"]) {
      if (node[property]) {
        const { leading, trailing } = path.call(
          () => printCommentsSeparately(path, options),
          property,
        );
        partsGroup.push(leading, print(property), indent(trailing));
      }
    }
  }

  if (node.superClass) {
    const printed = [
      printSuperClass(path, options, print),
      print("superTypeArguments"),
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
  let count = node.superClass ? 1 : 0;
  for (const listName of ["extends", "mixins", "implements"]) {
    if (Array.isArray(node[listName])) {
      count += node[listName].length;
    }
    if (count > 1) {
      return true;
    }
  }
  return count > 1;
}

/**
@returns {boolean}
*/
function shouldPrintClassInGroupModeWithoutCache(path) {
  const { node } = path;
  if (
    hasComment(node.id, CommentCheckFlags.Trailing) ||
    hasComment(node.typeParameters, CommentCheckFlags.Trailing) ||
    hasComment(node.superClass) ||
    hasMultipleHeritage(node)
  ) {
    return true;
  }

  if (node.superClass) {
    if (path.parent.type === "AssignmentExpression") {
      return false;
    }

    return !node.superTypeArguments && isMemberExpression(node.superClass);
  }

  const heritage =
    node.extends?.[0] ?? node.mixins?.[0] ?? node.implements?.[0];

  if (!heritage) {
    return false;
  }

  const groupMode =
    // `ClassImplements` seem not allow `QualifiedTypeIdentifier`
    (heritage.type === "InterfaceExtends" &&
      heritage.id.type === "QualifiedTypeIdentifier" &&
      !heritage.typeParameters) ||
    ((heritage.type === "TSClassImplements" ||
      heritage.type === "TSInterfaceHeritage") &&
      isMemberExpression(heritage.expression) &&
      !heritage.typeArguments);

  return groupMode;
}

const shouldPrintClassInGroupModeCache = new WeakMap();
function shouldPrintClassInGroupMode(path) {
  const { node } = path;
  if (!shouldPrintClassInGroupModeCache.has(node)) {
    shouldPrintClassInGroupModeCache.set(
      node,
      shouldPrintClassInGroupModeWithoutCache(path),
    );
  }

  return shouldPrintClassInGroupModeCache.get(node);
}

function printHeritageClauses(path, options, print, listName) {
  const { node } = path;
  if (!isNonEmptyArray(node[listName])) {
    return "";
  }

  const printedLeadingComments = printDanglingComments(path, options, {
    marker: listName,
  });

  const heritageClausesDoc = join([",", line], path.map(print, listName));

  // Make it print like `superClass`
  if (!hasMultipleHeritage(node)) {
    const printed = [
      `${listName} `,
      printedLeadingComments,
      heritageClausesDoc,
    ];
    if (shouldPrintClassInGroupMode(path)) {
      return [line, group(printed)];
    }
    return [" ", printed];
  }

  return [
    line,
    printedLeadingComments,
    printedLeadingComments && hardline,
    listName,
    group(indent([line, heritageClausesDoc])),
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

export { printClass, printClassMethod, printClassProperty };
export { printClassBody, printClassMemberSemicolon } from "./class-body.js";
