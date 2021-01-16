"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { join, line, group, indent, ifBreak },
} = require("../../document");
const { hasComment, identity, CommentCheckFlags } = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");
const { printTypeScriptModifiers } = require("./misc");

function printInterface(path, options, print) {
  const n = path.getValue();
  const parts = [];
  if (n.declare) {
    parts.push("declare ");
  }

  if (n.type === "TSInterfaceDeclaration") {
    parts.push(
      n.abstract ? "abstract " : "",
      printTypeScriptModifiers(path, options, print)
    );
  }

  parts.push("interface");

  const partsGroup = [];
  const extendsParts = [];

  if (n.type !== "InterfaceTypeAnnotation") {
    partsGroup.push(
      " ",
      path.call(print, "id"),
      path.call(print, "typeParameters")
    );
  }

  const shouldIndentOnlyHeritageClauses =
    n.typeParameters &&
    !hasComment(
      n.typeParameters,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line
    );

  if (isNonEmptyArray(n.extends)) {
    extendsParts.push(
      shouldIndentOnlyHeritageClauses
        ? ifBreak(" ", line, {
            groupId: getTypeParametersGroupId(n.typeParameters),
          })
        : line,
      "extends ",
      (n.extends.length === 1 ? identity : indent)(
        join([",", line], path.map(print, "extends"))
      )
    );
  }

  if (
    (n.id && hasComment(n.id, CommentCheckFlags.Trailing)) ||
    isNonEmptyArray(n.extends)
  ) {
    const printedExtends = extendsParts;
    if (shouldIndentOnlyHeritageClauses) {
      parts.push(
        group(
          partsGroup.concat(ifBreak(indent(printedExtends), printedExtends))
        )
      );
    } else {
      parts.push(group(indent(partsGroup.concat(printedExtends))));
    }
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", path.call(print, "body"));

  return group(parts);
}

module.exports = { printInterface };
