import { isNonEmptyArray } from "../../common/util.js";
import { join, line, group, indent, ifBreak } from "../../document/builders.js";
import { hasComment, identity, CommentCheckFlags } from "../utils/index.js";
import { getTypeParametersGroupId } from "./type-parameters.js";
import { printTypeScriptModifiers } from "./misc.js";

async function printInterface(path, options, print) {
  const node = path.getValue();
  const parts = [];
  if (node.declare) {
    parts.push("declare ");
  }

  if (node.type === "TSInterfaceDeclaration") {
    parts.push(
      node.abstract ? "abstract " : "",
      await printTypeScriptModifiers(path, options, print)
    );
  }

  parts.push("interface");

  const partsGroup = [];
  const extendsParts = [];

  if (node.type !== "InterfaceTypeAnnotation") {
    partsGroup.push(" ", await print("id"), await print("typeParameters"));
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
        join([",", line], await path.map(print, "extends"))
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

  parts.push(" ", await print("body"));

  return group(parts);
}

export { printInterface };
