"use strict";

const { isJsonSourceElement } = require("./utils.js");

function isSourceElement(node, parentNode, opts) {
  if (
    opts.parser === "json" ||
    opts.parser === "json5" ||
    opts.parser === "json-stringify"
  ) {
    return isJsonSourceElement(node);
  }
  const parentNodeType = parentNode && parentNode.type;
  // See https://www.ecma-international.org/ecma-262/5.1/#sec-A.5
  return (
    parentNodeType !== "DeclareExportDeclaration" &&
    node.type !== "TypeParameterDeclaration" &&
    (node.type === "Directive" ||
      node.type === "TypeAlias" ||
      node.type === "TSExportAssignment" ||
      node.type.startsWith("Declare") ||
      node.type.startsWith("TSDeclare") ||
      node.type.endsWith("Statement") ||
      node.type.endsWith("Declaration"))
  );
}

module.exports = isSourceElement;
