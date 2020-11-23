"use strict";

const {
  builders: { concat, join, line, group, indent, ifBreak },
} = require("../../document");
const { hasComment, identity, Comment } = require("../utils");
const { getTypeParametersGroupId } = require("./type-parameters");
const { printTypeScriptModifiers } = require("./misc");

function printInterface(path, options, print) {
  const n = path.getValue();
  const parts = [];
  if (n.type === "DeclareInterface" || n.declare) {
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
    !hasComment(n.typeParameters, Comment.trailing | Comment.line);

  if (n.extends && n.extends.length !== 0) {
    extendsParts.push(
      shouldIndentOnlyHeritageClauses
        ? ifBreak(" ", line, {
            groupId: getTypeParametersGroupId(n.typeParameters),
          })
        : line,
      "extends ",
      (n.extends.length === 1 ? identity : indent)(
        join(concat([",", line]), path.map(print, "extends"))
      )
    );
  }

  if (
    (n.id && hasComment(n.id, Comment.trailing)) ||
    (n.extends && n.extends.length !== 0)
  ) {
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

  return group(concat(parts));
}

module.exports = { printInterface };
