"use strict";

const { isNonEmptyArray } = require("../../common/util");
const {
  builders: { softline, group, indent, join, line, ifBreak, hardline },
} = require("../../document");
const { printDanglingComments } = require("../../main/comments");

// [prettierx]
const { removeLines } = require("../../document/doc-utils");

const {
  hasComment,
  CommentCheckFlags,
  shouldPrintComma,
  needsHardlineAfterDanglingComment,
} = require("../utils");
const { locStart, hasSameLoc } = require("../loc");
const {
  hasDecoratorsBeforeExport,
  printDecoratorsBeforeExport,
} = require("./decorators");

/**
 * @typedef {import("../../document").Doc} Doc
 */

function printImportDeclaration(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];

  const { importKind } = node;

  parts.push("import");

  if (importKind && importKind !== "value") {
    parts.push(" ", importKind);
  }

  parts.push(
    printModuleSpecifiers(path, options, print),
    printModuleSource(path, options, print),
    printImportAssertions(path, options, print),
    semi
  );

  return parts;
}

function printExportDeclaration(path, options, print) {
  const node = path.getValue();
  /** @type{Doc[]} */
  const parts = [];

  // Only print decorators here if they were written before the export,
  // otherwise they are printed by the node.declaration
  if (hasDecoratorsBeforeExport(node)) {
    parts.push(printDecoratorsBeforeExport(path, options, print));
  }

  const { type, exportKind, declaration } = node;

  parts.push("export");

  const isDefaultExport = node.default || type === "ExportDefaultDeclaration";
  if (isDefaultExport) {
    parts.push(" default");
  }

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(
      " ",
      printDanglingComments(path, options, /* sameIndent */ true)
    );

    if (needsHardlineAfterDanglingComment(node)) {
      parts.push(hardline);
    }
  }

  if (declaration) {
    parts.push(" ", print("declaration"));
  } else {
    parts.push(
      exportKind === "type" ? " type" : "",
      printModuleSpecifiers(path, options, print),
      printModuleSource(path, options, print),
      printImportAssertions(path, options, print)
    );
  }

  if (shouldExportDeclarationPrintSemi(node, options)) {
    parts.push(";");
  }

  return parts;
}

function printExportAllDeclaration(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];

  const { exportKind, exported } = node;

  parts.push("export");

  if (exportKind === "type") {
    parts.push(" type");
  }

  parts.push(" *");

  if (exported) {
    parts.push(" as ", print("exported"));
  }

  parts.push(
    printModuleSource(path, options, print),
    printImportAssertions(path, options, print),
    semi
  );

  return parts;
}

function shouldExportDeclarationPrintSemi(node, options) {
  if (!options.semi) {
    return false;
  }

  const { type, declaration } = node;
  const isDefaultExport = node.default || type === "ExportDefaultDeclaration";
  if (!declaration) {
    return true;
  }

  const { type: declarationType } = declaration;
  if (
    isDefaultExport &&
    declarationType !== "ClassDeclaration" &&
    declarationType !== "FunctionDeclaration" &&
    declarationType !== "TSInterfaceDeclaration" &&
    declarationType !== "DeclareClass" &&
    declarationType !== "DeclareFunction" &&
    declarationType !== "TSDeclareFunction" &&
    declarationType !== "EnumDeclaration"
  ) {
    return true;
  }
  return false;
}

function printModuleSource(path, options, print) {
  const node = path.getValue();

  if (!node.source) {
    return "";
  }

  /** @type{Doc[]} */
  const parts = [];
  if (!shouldNotPrintSpecifiers(node, options)) {
    parts.push(" from");
  }
  parts.push(" ", print("source"));

  return parts;
}

function printModuleSpecifiers(path, options, print) {
  const node = path.getValue();

  if (shouldNotPrintSpecifiers(node, options)) {
    return "";
  }

  /** @type{Doc[]} */
  const parts = [" "];

  if (isNonEmptyArray(node.specifiers)) {
    const standaloneSpecifiers = [];
    const groupedSpecifiers = [];

    // [prettierx] --no-export-curly-spacing & --no-import-curly-spacing support
    let isExport = false;

    // [prettierx] with --no-export-curly-spacing & --no-import-curly-spacing
    // option support (...)
    path.each(() => {
      const specifierType = path.getValue().type;
      if (
        specifierType === "ExportNamespaceSpecifier" ||
        specifierType === "ExportDefaultSpecifier"
      ) {
        // [prettierx] --no-export-curly-spacing option
        isExport = true;
        standaloneSpecifiers.push(print());
      } else if (
        specifierType === "ImportNamespaceSpecifier" ||
        specifierType === "ImportDefaultSpecifier"
      ) {
        // [prettierx] --no-import-curly-spacing option
        isExport = false;
        standaloneSpecifiers.push(print());
      } else if (specifierType === "ExportSpecifier") {
        // [prettierx] --no-export-curly-spacing option
        isExport = true;
        groupedSpecifiers.push(print());
      } else if (specifierType === "ImportSpecifier") {
        // [prettierx] --no-import-curly-spacing option
        isExport = false;
        groupedSpecifiers.push(print());
      } else {
        /* istanbul ignore next */
        throw new Error(
          `Unknown specifier type ${JSON.stringify(specifierType)}`
        );
      }
    }, "specifiers");

    parts.push(join(", ", standaloneSpecifiers));

    // [prettierx] --no-export-curly-spacing & --no-import-curly-spacing support
    const curlySpacing = isExport
      ? options.exportCurlySpacing
      : options.importCurlySpacing;
    const curlyLine = curlySpacing ? line : softline;

    if (groupedSpecifiers.length > 0) {
      if (standaloneSpecifiers.length > 0) {
        parts.push(", ");
      }

      const canBreak =
        // prettierx: importFormatting
        options.importFormatting !== "oneline" &&
        (groupedSpecifiers.length > 1 ||
          standaloneSpecifiers.length > 0 ||
          node.specifiers.some((node) => hasComment(node)));

      if (canBreak) {
        parts.push(
          group([
            "{",
            indent([
              // [prettierx] with --no-export-curly-spacing & --no-import-curly-spacing
              // option support (...)
              curlyLine,
              join([",", line], groupedSpecifiers),
            ]),
            ifBreak(shouldPrintComma(options) ? "," : ""),
            // [prettierx] --no-import-curly-spacing & --no-export-curly-spacing options
            curlyLine,
            "}",
          ])
        );
      } else {
        parts.push(
          removeLines([
            "{",
            // [prettierx] --no-import-curly-spacing, --no-export-curly-spacing options
            curlyLine,
            join([",", line], groupedSpecifiers),
            // [prettierx] --no-import-curly-spacing, --no-export-curly-spacing options
            curlyLine,
            "}",
          ])
        );
      }
    }
  } else {
    parts.push("{}");
  }
  return parts;
}

function shouldNotPrintSpecifiers(node, options) {
  const { type, importKind, source, specifiers } = node;

  if (
    type !== "ImportDeclaration" ||
    isNonEmptyArray(specifiers) ||
    importKind === "type"
  ) {
    return false;
  }

  // TODO: check tokens
  return !/{\s*}/.test(
    options.originalText.slice(locStart(node), locStart(source))
  );
}

function printImportAssertions(path, options, print) {
  const node = path.getNode();
  if (isNonEmptyArray(node.assertions)) {
    return [
      " assert {",
      // [prettierx] --no-import-curly-spacing option
      options.importCurlySpacing ? " " : "",
      join(", ", path.map(print, "assertions")),
      // [prettierx] --no-import-curly-spacing option
      options.importCurlySpacing ? " " : "",
      "}",
    ];
  }
  return "";
}

function printModuleSpecifier(path, options, print) {
  const node = path.getNode();

  const { type, importKind } = node;
  /** @type{Doc[]} */
  const parts = [];
  if (type === "ImportSpecifier" && importKind) {
    parts.push(importKind, " ");
  }

  const isImport = type.startsWith("Import");
  const leftSideProperty = isImport ? "imported" : "local";
  const rightSideProperty = isImport ? "local" : "exported";
  let left = "";
  let right = "";
  if (
    type === "ExportNamespaceSpecifier" ||
    type === "ImportNamespaceSpecifier"
  ) {
    left = "*";
  } else if (node[leftSideProperty]) {
    left = print(leftSideProperty);
  }

  if (
    node[rightSideProperty] &&
    (!node[leftSideProperty] ||
      // import {a as a} from '.'
      !hasSameLoc(node[leftSideProperty], node[rightSideProperty]))
  ) {
    right = print(rightSideProperty);
  }

  parts.push(left, left && right ? " as " : "", right);
  return parts;
}

module.exports = {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSpecifier,
};
