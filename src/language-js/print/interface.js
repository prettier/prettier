"use strict";

const { isNonEmptyArray } = require("../../common/util.js");
const {
  builders: { join, line, group, indent, ifBreak },
} = require("../../document/index.js");
const { hasComment, identity, CommentCheckFlags } = require("../utils.js");
const { getTypeParametersGroupId } = require("./type-parameters.js");
const { printTypeScriptModifiers } = require("./misc.js");

function printInterface(path, options, print) {
  const node = path.getValue();
  const parts = [];
  if (node.declare) {
    parts.push("declare ");
  }

  if (node.type === "TSInterfaceDeclaration") {
    parts.push(
      node.abstract ? "abstract " : "",
      printTypeScriptModifiers(path, options, print)
    );
  }

  parts.push("interface");

  const partsGroup = [];
  const extendsParts = [];

  if (node.type !== "InterfaceTypeAnnotation") {
    partsGroup.push(" ", print("id"), print("typeParameters"));
  }

  const shouldIndentOnlyHeritageClauses =
    node.typeParameters &&
    !hasComment(
      node.typeParameters,
      CommentCheckFlags.Trailing | CommentCheckFlags.Line
    );

  if (isNonEmptyArray(node.extends)) {
    extendsParts.push(
      shouldIndentOnlyHeritageClauses
        ? ifBreak(" ", line, {
            groupId: getTypeParametersGroupId(node.typeParameters),
          })
        : line,
      "extends ",
      (node.extends.length === 1 ? identity : indent)(
        join([",", line], path.map(print, "extends"))
      )
    );
  }

  if (
    (node.id && hasComment(node.id, CommentCheckFlags.Trailing)) ||
    isNonEmptyArray(node.extends)
  ) {
    if (shouldIndentOnlyHeritageClauses) {
      parts.push(group([...partsGroup, indent(extendsParts)]));
    } else {
      parts.push(group(indent([...partsGroup, ...extendsParts])));
    }
  } else {
    parts.push(...partsGroup, ...extendsParts);
  }

  parts.push(" ", print("body"));

  return group(parts);
}

module.exports = { printInterface };
