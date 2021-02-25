"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { line, hardline },
} = require("../../document");
const { locStart } = require("../loc");
const {
  getParentExportDeclaration,
  hasNewlineBetweenOrAfterDecorators,
  isExportDeclaration,
} = require("../utils");

function printDecorators(path, options, print) {
  const node = path.getValue();
  const parentExportDecl = getParentExportDeclaration(path);
  if (
    isNonEmptyArray(node.decorators) &&
    // If the parent node is an export declaration and the decorator
    // was written before the export, the export will be responsible
    // for printing the decorators.
    !(
      parentExportDecl &&
      locStart(parentExportDecl, { ignoreDecorators: true }) >
        locStart(node.decorators[0])
    )
  ) {
    const shouldBreak =
      node.type === "ClassExpression" ||
      node.type === "ClassDeclaration" ||
      hasNewlineBetweenOrAfterDecorators(node, options);
    return [
      parentExportDecl ? hardline : shouldBreak ? breakParent : "",
      join(line, path.map(print, "decorators")),
      line,
    ];
  }

  if (
    isExportDeclaration(node) &&
    node.declaration &&
    isNonEmptyArray(node.declaration.decorators) &&
    // Only print decorators here if they were written before the export,
    // otherwise they are printed by the node.declaration
    locStart(node, { ignoreDecorators: true }) >
      locStart(node.declaration.decorators[0])
  ) {
    // Export declarations are responsible for printing any decorators
    // that logically apply to node.declaration.
    return [
      join(hardline, path.map(print, "declaration", "decorators")),
      hardline,
    ];
  }

  return "";
}

module.exports = { printDecorators };
