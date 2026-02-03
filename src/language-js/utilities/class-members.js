import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locStart } from "../location/index.js";

/**
@import AstPath from "../../common/ast-path.js";
@import {Node, NodeMap} from "../types/estree.js";
*/

const flowObjectTypeAnnotationChildrenProperties = [
  "properties",
  "indexers",
  "callProperties",
  "internalSlots",
];

function iterateClassMembersPath(path, iteratee) {
  const { node } = path;
  if (node.type === "ClassBody" || node.type === "TSInterfaceBody") {
    path.each(iteratee, "body");
    return;
  }

  if (node.type === "TSTypeLiteral") {
    path.each(iteratee, "members");
    return;
  }

  if (node.type === "RecordDeclarationBody") {
    path.each(iteratee, "elements");
    return;
  }

  if (node.type === "ObjectTypeAnnotation") {
    // Unfortunately, things grouped together in the ast can be
    // interleaved in the source code. So we need to reorder them before
    // printing them.
    const children = flowObjectTypeAnnotationChildrenProperties
      .flatMap((field) =>
        path.map(
          ({ node, index }) => ({
            node,
            loc: locStart(node),
            selector: [field, index],
          }),
          field,
        ),
      )
      .sort((a, b) => a.loc - b.loc);

    for (const [index, { node, selector }] of children.entries()) {
      path.call(
        () =>
          iteratee({
            node,
            next: children[index + 1]?.node,
            isLast: index === children.length - 1,
          }),
        ...selector,
      );
    }
  }
}

/**
@param {
  | NodeMap["ClassBody"]
  | NodeMap["TSInterfaceBody"]
  | NodeMap["RecordDeclarationBody"]
  | NodeMap["ObjectTypeAnnotation"]
} node
@returns {boolean}
*/
function isNonEmptyClassBody(node) {
  if (node.type === "ObjectTypeAnnotation") {
    return flowObjectTypeAnnotationChildrenProperties.some((property) =>
      isNonEmptyArray(node[property]),
    );
  }

  const members =
    node.type === "RecordDeclarationBody" ? node.elements : node.body;

  return isNonEmptyArray(members);
}

export { isNonEmptyClassBody, iterateClassMembersPath };
