"use strict";

const { printComments, printDanglingComments } = require("../../main/comments");
const {
  builders: { concat, join, line, hardline, softline, group, indent, ifBreak },
} = require("../../document");
const { hasTrailingComment, hasTrailingLineComment } = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");

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

  const hasMultipleHeritage =
    ["superClass", "extends", "mixins", "implements"].filter((key) => !!n[key])
      .length > 1;
  const shouldIndentOnlyHeritageClauses =
    n.typeParameters &&
    !hasTrailingLineComment(n.typeParameters) &&
    !hasMultipleHeritage;

  function printList(listName) {
    if (n[listName] && n[listName].length !== 0) {
      const printedLeadingComments = printDanglingComments(
        path,
        options,
        /* sameIndent */ true,
        ({ marker }) => marker === listName
      );
      extendsParts.push(
        shouldIndentOnlyHeritageClauses
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
        )
      );
    }
  }

  if (n.superClass) {
    const printSuperClass = (path) => {
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
    };
    const printed = concat([
      "extends ",
      printSuperClass(path),
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
    printList("extends");
  }

  printList("mixins");
  printList("implements");

  if (groupMode) {
    const printedExtends = concat(extendsParts);
    if (shouldIndentOnlyHeritageClauses) {
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

  return parts;
}

module.exports = { printClass };
