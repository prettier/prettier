"use strict";

const { isNonEmptyArray } = require("../../common/util.js");
const {
  builders: { softline, group, indent, join, line, ifBreak, hardline },
} = require("../../document/index.js");
const { printDanglingComments } = require("../../main/comments.js");

const {
  hasComment,
  CommentCheckFlags,
  shouldPrintComma,
  needsHardlineAfterDanglingComment,
  isStringLiteral,
  rawText,
} = require("../utils/index.js");
const { locStart, hasSameLoc } = require("../loc.js");
const {
  hasDecoratorsBeforeExport,
  printDecoratorsBeforeExport,
} = require("./decorators.js");

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

    path.each(() => {
      const specifierType = path.getValue().type;
      if (
        specifierType === "ExportNamespaceSpecifier" ||
        specifierType === "ExportDefaultSpecifier" ||
        specifierType === "ImportNamespaceSpecifier" ||
        specifierType === "ImportDefaultSpecifier"
      ) {
        standaloneSpecifiers.push(print());
      } else if (
        specifierType === "ExportSpecifier" ||
        specifierType === "ImportSpecifier"
      ) {
        groupedSpecifiers.push(print());
      } else {
        /* istanbul ignore next */
        throw new Error(
          `Unknown specifier type ${JSON.stringify(specifierType)}`
        );
      }
    }, "specifiers");

    parts.push(join(", ", standaloneSpecifiers));

    if (groupedSpecifiers.length > 0) {
      if (standaloneSpecifiers.length > 0) {
        parts.push(", ");
      }

      const canBreak =
        groupedSpecifiers.length > 1 ||
        standaloneSpecifiers.length > 0 ||
        node.specifiers.some((node) => hasComment(node));

      if (canBreak) {
        parts.push(
          group([
            "{",
            indent([
              options.bracketSpacing ? line : softline,
              join([",", line], groupedSpecifiers),
            ]),
            ifBreak(shouldPrintComma(options) ? "," : ""),
            options.bracketSpacing ? line : softline,
            "}",
          ])
        );
      } else {
        parts.push([
          "{",
          options.bracketSpacing ? " " : "",
          ...groupedSpecifiers,
          options.bracketSpacing ? " " : "",
          "}",
        ]);
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
      options.bracketSpacing ? " " : "",
      join(", ", path.map(print, "assertions")),
      options.bracketSpacing ? " " : "",
      "}",
    ];
  }
  return "";
}

function printModuleSpecifier(path, options, print) {
  const node = path.getNode();

  const { type } = node;

  /** @type {Doc[]} */
  const parts = [];

  /** @type {"type" | "typeof" | "value"} */
  const kind = type === "ImportSpecifier" ? node.importKind : node.exportKind;

  if (kind && kind !== "value") {
    parts.push(kind, " ");
  }

  const isImport = type.startsWith("Import");
  const leftSideProperty = isImport ? "imported" : "local";
  const rightSideProperty = isImport ? "local" : "exported";
  const leftSideNode = node[leftSideProperty];
  const rightSideNode = node[rightSideProperty];
  let left = "";
  let right = "";
  if (
    type === "ExportNamespaceSpecifier" ||
    type === "ImportNamespaceSpecifier"
  ) {
    left = "*";
  } else if (leftSideNode) {
    left = print(leftSideProperty);
  }

  if (rightSideNode && !isShorthandSpecifier(node)) {
    right = print(rightSideProperty);
  }

  parts.push(left, left && right ? " as " : "", right);
  return parts;
}

function isShorthandSpecifier(specifier) {
  if (
    specifier.type !== "ImportSpecifier" &&
    specifier.type !== "ExportSpecifier"
  ) {
    return false;
  }

  const {
    local,
    [specifier.type === "ImportSpecifier" ? "imported" : "exported"]:
      importedOrExported,
  } = specifier;

  if (
    local.type !== importedOrExported.type ||
    !hasSameLoc(local, importedOrExported)
  ) {
    return false;
  }

  if (isStringLiteral(local)) {
    return (
      local.value === importedOrExported.value &&
      rawText(local) === rawText(importedOrExported)
    );
  }

  switch (local.type) {
    case "Identifier":
      return local.name === importedOrExported.name;
    default:
      /* istanbul ignore next */
      return false;
  }
}

module.exports = {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSpecifier,
};
