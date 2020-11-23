"use strict";

const {
  builders: { concat, softline, group, indent, join, line, ifBreak, hardline },
} = require("../../document");
const { printDanglingComments } = require("../../main/comments");

const {
  hasComment,
  Comment,
  shouldPrintComma,
  needsHardlineAfterDanglingComment,
} = require("../utils");
const { locStart, hasSameLoc } = require("../loc");

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
    printImportAssertions(path, options, print)
  );

  parts.push(semi);

  return concat(parts);
}

function printExportDeclaration(path, options, print) {
  const node = path.getValue();
  /** @type{Doc[]} */
  const parts = [];

  const { type, exportKind, declaration } = node;

  parts.push("export");

  const isDefaultExport = node.default || type === "ExportDefaultDeclaration";
  if (isDefaultExport) {
    parts.push(" default");
  }

  if (hasComment(node, Comment.dangling)) {
    parts.push(
      " ",
      printDanglingComments(path, options, /* sameIndent */ true)
    );

    if (needsHardlineAfterDanglingComment(node)) {
      parts.push(hardline);
    }
  }

  if (declaration) {
    parts.push(" ", path.call(print, "declaration"));
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

  return concat(parts);
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
    parts.push(" as ", path.call(print, "exported"));
  }

  parts.push(
    printModuleSource(path, options, print),
    printImportAssertions(path, options, print),
    semi
  );

  return concat(parts);
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
  parts.push(" ", path.call(print, "source"));

  return concat(parts);
}

function printModuleSpecifiers(path, options, print) {
  const node = path.getValue();

  if (shouldNotPrintSpecifiers(node, options)) {
    return "";
  }

  /** @type{Doc[]} */
  const parts = [" "];

  if (node.specifiers && node.specifiers.length > 0) {
    const standaloneSpecifiers = [];
    const groupedSpecifiers = [];

    path.each((specifierPath) => {
      const specifierType = path.getValue().type;
      if (
        specifierType === "ExportNamespaceSpecifier" ||
        specifierType === "ExportDefaultSpecifier" ||
        specifierType === "ImportNamespaceSpecifier" ||
        specifierType === "ImportDefaultSpecifier"
      ) {
        standaloneSpecifiers.push(print(specifierPath));
      } else if (
        specifierType === "ExportSpecifier" ||
        specifierType === "ImportSpecifier"
      ) {
        groupedSpecifiers.push(print(specifierPath));
      } else {
        /* istanbul ignore next */
        throw new Error(
          `Unknown specifier type ${JSON.stringify(specifierType)}`
        );
      }
    }, "specifiers");

    parts.push(join(", ", standaloneSpecifiers));

    if (groupedSpecifiers.length !== 0) {
      if (standaloneSpecifiers.length !== 0) {
        parts.push(", ");
      }

      const canBreak =
        groupedSpecifiers.length > 1 ||
        standaloneSpecifiers.length > 0 ||
        node.specifiers.some((node) => hasComment(node));

      if (canBreak) {
        parts.push(
          group(
            concat([
              "{",
              indent(
                concat([
                  options.bracketSpacing ? line : softline,
                  join(concat([",", line]), groupedSpecifiers),
                ])
              ),
              ifBreak(shouldPrintComma(options) ? "," : ""),
              options.bracketSpacing ? line : softline,
              "}",
            ])
          )
        );
      } else {
        parts.push(
          concat([
            "{",
            options.bracketSpacing ? " " : "",
            concat(groupedSpecifiers),
            options.bracketSpacing ? " " : "",
            "}",
          ])
        );
      }
    }
  } else {
    parts.push("{}");
  }
  return concat(parts);
}

function shouldNotPrintSpecifiers(node, options) {
  const { type, importKind, source, specifiers } = node;

  if (
    type !== "ImportDeclaration" ||
    (Array.isArray(specifiers) && specifiers.length > 0) ||
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
  if (Array.isArray(node.assertions) && node.assertions.length !== 0) {
    return concat([
      " assert {",
      options.bracketSpacing ? " " : "",
      join(", ", path.map(print, "assertions")),
      options.bracketSpacing ? " " : "",
      "}",
    ]);
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
    left = path.call(print, leftSideProperty);
  }

  if (
    node[rightSideProperty] &&
    (!node[leftSideProperty] ||
      // import {a as a} from '.'
      !hasSameLoc(node[leftSideProperty], node[rightSideProperty]))
  ) {
    right = path.call(print, rightSideProperty);
  }

  parts.push(left, left && right ? " as " : "", right);
  return concat(parts);
}

module.exports = {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSpecifier,
};
