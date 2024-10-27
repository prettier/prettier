"use strict";

const { isNonEmptyArray, hasNewline } = require("../../common/util");
const {
  builders: { line, hardline, join, breakParent, group },
} = require("../../document");
const { locStart, locEnd } = require("../loc");
const { getParentExportDeclaration } = require("../utils");

function printClassMemberDecorators(path, options, print) {
  const node = path.getValue();
  return group([
    join(line, path.map(print, "decorators")),
    hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
  ]);
}

function printDecoratorsBeforeExport(path, options, print) {
  // Export declarations are responsible for printing any decorators
  // that logically apply to node.declaration.
  return [
    join(hardline, path.map(print, "declaration", "decorators")),
    hardline,
  ];
}

function printDecorators(path, options, print) {
  const node = path.getValue();
  const { decorators } = node;

  if (
    !isNonEmptyArray(decorators) ||
    // If the parent node is an export declaration and the decorator
    // was written before the export, the export will be responsible
    // for printing the decorators.
    hasDecoratorsBeforeExport(path.getParentNode())
  ) {
    return;
  }

  const shouldBreak =
    node.type === "ClassExpression" ||
    node.type === "ClassDeclaration" ||
    hasNewlineBetweenOrAfterDecorators(node, options);

  return [
    getParentExportDeclaration(path)
      ? hardline
      : shouldBreak
      ? breakParent
      : "",
    join(line, path.map(print, "decorators")),
    line,
  ];
}

function hasNewlineBetweenOrAfterDecorators(node, options) {
  return node.decorators.some((decorator) =>
    hasNewline(options.originalText, locEnd(decorator))
  );
}

function hasDecoratorsBeforeExport(node) {
  if (
    node.type !== "ExportDefaultDeclaration" &&
    node.type !== "ExportNamedDeclaration" &&
    node.type !== "DeclareExportDeclaration"
  ) {
    return false;
  }

  const decorators = node.declaration && node.declaration.decorators;

  return (
    isNonEmptyArray(decorators) &&
    locStart(node, { ignoreDecorators: true }) > locStart(decorators[0])
  );
}

module.exports = {
  printDecorators,
  printClassMemberDecorators,
  printDecoratorsBeforeExport,
  hasDecoratorsBeforeExport,
};
