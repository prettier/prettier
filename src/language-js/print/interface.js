import { isNonEmptyArray } from "../../common/util.js";
import doc from "../../document/index.js";
import { hasComment, identity, CommentCheckFlags } from "../utils/index.js";
import { getTypeParametersGroupId } from "./type-parameters.js";
import { printTypeScriptModifiers } from "./misc.js";

const {
  builders: { join, line, group, indent, ifBreak },
} = doc;

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

export { printInterface };
