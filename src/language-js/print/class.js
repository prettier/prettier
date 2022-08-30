import { isNonEmptyArray, createGroupIdMapper } from "../../common/util.js";
import { printComments, printDanglingComments } from "../../main/comments.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  indent,
  ifBreak,
} from "../../document/builders.js";
import { hasComment, CommentCheckFlags } from "../utils/index.js";
import { getTypeParametersGroupId } from "./type-parameters.js";
import { printMethod } from "./function.js";
import {
  printOptionalToken,
  printTypeAnnotation,
  printDefiniteToken,
} from "./misc.js";
import { printPropertyKey } from "./property.js";
import { printAssignment } from "./assignment.js";
import { printClassMemberDecorators } from "./decorators.js";

function printClass(path, options, print) {
  const node = path.getValue();
  const parts = [];

  if (node.declare) {
    parts.push("declare ");
  }

  if (node.abstract) {
    parts.push("abstract ");
  }

  parts.push("class");

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    (node.id && hasComment(node.id, CommentCheckFlags.Trailing)) ||
    (node.typeParameters &&
      hasComment(node.typeParameters, CommentCheckFlags.Trailing)) ||
    (node.superClass && hasComment(node.superClass)) ||
    isNonEmptyArray(node.extends) || // DeclareClass
    isNonEmptyArray(node.mixins) ||
    isNonEmptyArray(node.implements);

  const partsGroup = [];
  const extendsParts = [];

  if (node.id) {
    partsGroup.push(" ", print("id"));
  }

  partsGroup.push(print("typeParameters"));

  if (node.superClass) {
    const printed = [
      printSuperClass(path, options, print),
      print("superTypeParameters"),
    ];
    const printedWithComments = path.call(
      (superClass) => ["extends ", printComments(superClass, printed, options)],
      "superClass"
    );
    if (groupMode) {
      extendsParts.push(line, group(printedWithComments));
    } else {
      extendsParts.push(" ", printedWithComments);
    }
  } else {
    extendsParts.push(printList(path, options, print, "extends"));
  }

  extendsParts.push(
    printList(path, options, print, "mixins"),
    printList(path, options, print, "implements")
  );

  if (groupMode) {
    let printedPartsGroup;
    if (shouldIndentOnlyHeritageClauses(node)) {
      printedPartsGroup = [...partsGroup, indent(extendsParts)];
    } else {
      printedPartsGroup = indent([...partsGroup, extendsParts]);
    }
    parts.push(group(printedPartsGroup, { id: getHeritageGroupId(node) }));
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", print("body"));

  return parts;
}

const getHeritageGroupId = createGroupIdMapper("heritageGroup");

function printHardlineAfterHeritage(node) {
  return ifBreak(hardline, "", { groupId: getHeritageGroupId(node) });
}

function hasMultipleHeritage(node) {
  return (
    ["superClass", "extends", "mixins", "implements"].filter((key) =>
      Boolean(node[key])
    ).length > 1
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

function printList(path, options, print, listName) {
  const node = path.getValue();
  if (!isNonEmptyArray(node[listName])) {
    return "";
  }

  const printedLeadingComments = printDanglingComments(
    path,
    options,
    /* sameIndent */ true,
    ({ marker }) => marker === listName
  );
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
  const parent = path.getParentNode();
  if (parent.type === "AssignmentExpression") {
    return group(
      ifBreak(["(", indent([softline, printed]), softline, ")"], printed)
    );
  }
  return printed;
}

function printClassMethod(path, options, print) {
  const node = path.getValue();
  const parts = [];

  if (isNonEmptyArray(node.decorators)) {
    parts.push(printClassMemberDecorators(path, options, print));
  }
  if (node.accessibility) {
    parts.push(node.accessibility + " ");
  }
  // "readonly" and "declare" are supported by only "babel-ts"
  // https://github.com/prettier/prettier/issues/9760
  if (node.readonly) {
    parts.push("readonly ");
  }
  if (node.declare) {
    parts.push("declare ");
  }

  if (node.static) {
    parts.push("static ");
  }
  if (node.type === "TSAbstractMethodDefinition" || node.abstract) {
    parts.push("abstract ");
  }
  if (node.override) {
    parts.push("override ");
  }

  parts.push(printMethod(path, options, print));

  return parts;
}

function printClassProperty(path, options, print) {
  const node = path.getValue();
  const parts = [];
  const semi = options.semi ? ";" : "";

  if (isNonEmptyArray(node.decorators)) {
    parts.push(printClassMemberDecorators(path, options, print));
  }
  if (node.accessibility) {
    parts.push(node.accessibility + " ");
  }
  if (node.declare) {
    parts.push("declare ");
  }
  if (node.static) {
    parts.push("static ");
  }
  if (node.type === "TSAbstractPropertyDefinition" || node.abstract) {
    parts.push("abstract ");
  }
  if (node.override) {
    parts.push("override ");
  }
  if (node.readonly) {
    parts.push("readonly ");
  }
  if (node.variance) {
    parts.push(print("variance"));
  }
  if (node.type === "ClassAccessorProperty") {
    parts.push("accessor ");
  }
  parts.push(
    printPropertyKey(path, options, print),
    printOptionalToken(path),
    printDefiniteToken(path),
    printTypeAnnotation(path, options, print)
  );

  return [
    printAssignment(
      path,
      options,
      print,
      parts,
      " =",
      node.type === "TSAbstractPropertyDefinition" ? undefined : "value"
    ),
    semi,
  ];
}

export {
  printClass,
  printClassMethod,
  printClassProperty,
  printHardlineAfterHeritage,
};
