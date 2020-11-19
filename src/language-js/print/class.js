"use strict";

const { printComments, printDanglingComments } = require("../../main/comments");
const {
  builders: { concat, join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const { hasTrailingComment, hasTrailingLineComment } = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");
const { printMethod } = require("./function");
const { printDecorators } = require("./misc");

function printClass(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.abstract) {
    parts.push("abstract ");
  }

  parts.push("class");

  // Keep old behaviour of extends in same line
  // If there is only on extends and there are not comments
  const groupMode =
    (n.id && hasTrailingComment(n.id)) ||
    (n.superClass &&
      n.superClass.comments &&
      n.superClass.comments.length !== 0) ||
    (n.extends && n.extends.length !== 0) || // DeclareClass
    (n.mixins && n.mixins.length !== 0) ||
    (n.implements && n.implements.length !== 0);

  const partsGroup = [];
  const extendsParts = [];

  if (n.id) {
    partsGroup.push(" ", path.call(print, "id"));
  }

  partsGroup.push(path.call(print, "typeParameters"));

  if (n.superClass) {
    const printed = concat([
      "extends ",
      printSuperClass(path, options, print),
      path.call(print, "superTypeParameters"),
    ]);
    const printedWithComments = path.call(
      (superClass) => printComments(superClass, () => printed, options),
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

  extendsParts.push(printList(path, options, print, "mixins"));
  extendsParts.push(printList(path, options, print, "implements"));

  if (groupMode) {
    const printedExtends = concat(extendsParts);
    if (shouldIndentOnlyHeritageClauses(n)) {
      parts.push(
        group(
          concat(
            partsGroup.concat(ifBreak(indent(printedExtends), printedExtends))
          )
        )
      );
    } else {
      parts.push(group(indent(concat(partsGroup.concat(printedExtends)))));
    }
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", path.call(print, "body"));

  return concat(parts);
}

function hasMultipleHeritage(node) {
  return (
    ["superClass", "extends", "mixins", "implements"].filter(
      (key) => !!node[key]
    ).length > 1
  );
}

function shouldIndentOnlyHeritageClauses(node) {
  return (
    node.typeParameters &&
    !hasTrailingLineComment(node.typeParameters) &&
    !hasMultipleHeritage(node)
  );
}

function printList(path, options, print, listName) {
  const n = path.getValue();
  if (!n[listName] || n[listName].length === 0) {
    return "";
  }

  const printedLeadingComments = printDanglingComments(
    path,
    options,
    /* sameIndent */ true,
    ({ marker }) => marker === listName
  );
  return concat([
    shouldIndentOnlyHeritageClauses(n)
      ? ifBreak(" ", line, {
          groupId: getTypeParametersGroupId(n.typeParameters),
        })
      : line,
    printedLeadingComments,
    printedLeadingComments && hardline,
    listName,
    group(
      indent(
        concat([line, join(concat([",", line]), path.map(print, listName))])
      )
    ),
  ]);
}

function printSuperClass(path, options, print) {
  const printed = path.call(print, "superClass");
  const parent = path.getParentNode();
  if (parent && parent.type === "AssignmentExpression") {
    return concat([
      ifBreak("("),
      indent(concat([softline, printed])),
      softline,
      ifBreak(")"),
    ]);
  }
  return printed;
}

function printClassMethod(path, options, print) {
  const n = path.getValue();
  const parts = [];

  if (n.decorators && n.decorators.length !== 0) {
    parts.push(printDecorators(path, options, print));
  }
  if (n.accessibility) {
    parts.push(n.accessibility + " ");
  }
  if (n.static) {
    parts.push("static ");
  }
  if (n.type === "TSAbstractMethodDefinition" || n.abstract) {
    parts.push("abstract ");
  }

  parts.push(printMethod(path, options, print));

  return concat(parts);
}

module.exports = { printClass, printClassMethod };
