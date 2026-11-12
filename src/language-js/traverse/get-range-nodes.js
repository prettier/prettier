import { getRangeNodes as jsonGetRangeNodes } from "../../language-json/get-range-nodes.js";
import { findSiblingAncestors } from "../../main/range.js";
import { isExportAssignment } from "../utilities/node-types.js";

function isForXStatementInitializer(node, parent) {
  return (
    (parent?.type === "ForStatement" && parent.init === node) ||
    ((parent?.type === "ForInStatement" || parent?.type === "ForOfStatement") &&
      parent.left === node)
  );
}

// See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
function isJsSourceElement(node, parent) {
  const { type } = node;
  return (
    parent?.type !== "DeclareExportDeclaration" &&
    type !== "TypeParameterDeclaration" &&
    type !== "TSTypeParameterDeclaration" &&
    !(
      type === "VariableDeclaration" && isForXStatementInitializer(node, parent)
    ) &&
    (type === "Directive" ||
      type === "TypeAlias" ||
      isExportAssignment(node) ||
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
