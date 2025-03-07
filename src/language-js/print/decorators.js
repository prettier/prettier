import {
  breakParent,
  group,
  hardline,
  join,
  line,
} from "../../document/builders.js";
import hasNewline from "../../utils/has-newline.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import { hasSameLocStart, locEnd } from "../loc.js";
import { isExportDeclaration } from "../utils/index.js";
import isIgnored from "../utils/is-ignored.js";

function printClassMemberDecorators(path, options, print) {
  const { node } = path;
  return group([
    join(line, path.map(print, "decorators")),
    hasNewlineBetweenOrAfterDecorators(node, options) ? hardline : line,
  ]);
}

function printDecoratorsBeforeExport(path, options, print) {
  // Only print decorators here if they were written before the export,
  // otherwise they are printed by the node.declaration
  if (!hasDecoratorsBeforeExport(path.node)) {
    return "";
  }

  // Export declarations are responsible for printing any decorators
  // that logically apply to node.declaration.
  return [
    join(hardline, path.map(print, "declaration", "decorators")),
    hardline,
  ];
}

function printDecorators(path, options, print) {
  const { node, parent } = path;
  const { decorators } = node;

  if (
    !isNonEmptyArray(decorators) ||
    // If the parent node is an export declaration and the decorator
    // was written before the export, the export will be responsible
    // for printing the decorators.
    hasDecoratorsBeforeExport(parent) ||
    // Decorators already printed in ignored node
    isIgnored(path)
  ) {
    return "";
  }

  const shouldBreak =
    node.type === "ClassExpression" ||
    node.type === "ClassDeclaration" ||
    hasNewlineBetweenOrAfterDecorators(node, options);

  return [
    path.key === "declaration" && isExportDeclaration(parent)
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
    hasNewline(options.originalText, locEnd(decorator)),
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

  const decorators = node.declaration?.decorators;

  return isNonEmptyArray(decorators) && hasSameLocStart(node, decorators[0]);
}

export {
  printClassMemberDecorators,
  printDecorators,
  printDecoratorsBeforeExport,
};
