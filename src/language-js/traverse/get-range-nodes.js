import { getRangeNodes as jsonGetRangeNodes } from "../../language-json/get-range-nodes.js";
import { findSiblingAncestors } from "../../main/range.js";

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
function isJsSourceElement(node, parentNode) {
  const { type } = node;
  return (
    parentNode?.type !== "DeclareExportDeclaration" &&
    type !== "TypeParameterDeclaration" &&
    (type === "Directive" ||
      type === "TypeAlias" ||
      type === "TSExportAssignment" ||
      type.startsWith("Declare") ||
      type.startsWith("TSDeclare") ||
      type.endsWith("Statement") ||
      type.endsWith("Declaration"))
  );
}

function getRangeNodes(startNodeAndAncestors, endNodeAndAncestors, options) {
  const rootNode = startNodeAndAncestors.at(-1);
  return rootNode.type === "JsonRoot"
    ? jsonGetRangeNodes(startNodeAndAncestors, endNodeAndAncestors)
    : findSiblingAncestors(
        startNodeAndAncestors,
        endNodeAndAncestors,
        isJsSourceElement,
        options,
      );
}

export { getRangeNodes };
