"use strict";

const {
  builders: { concat, softline, group, indent, join, line, ifBreak, hardline },
} = require("../../document");
const { printDanglingComments } = require("../../main/comments");

const {
  shouldPrintComma,
  needsHardlineAfterDanglingComment,
} = require("../utils");
const { locStart } = require("../loc");

/**
 * @typedef {import("../../document").Doc} Doc
 */

function printImportDeclaration(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];

  const { importKind, specifiers, source } = node;

  parts.push("import");

  if (importKind && importKind !== "value") {
    parts.push(" ", importKind);
  }

  if (specifiers && specifiers.length > 0) {
    parts.push(printModuleSpecifiers(path, options, print));
    parts.push(printModuleSource(path, options, print));
  } else if (
    (importKind && importKind === "type") ||
    // import {} from 'x'
    /{\s*}/.test(options.originalText.slice(locStart(node), locStart(source)))
  ) {
    parts.push(" {}", printModuleSource(path, options, print));
  } else {
    parts.push(" ", path.call(print, "source"));
  }

  parts.push(printImportAssertions(path, options, print));

  parts.push(semi);

  return concat(parts);
}

function printExportDeclaration(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];

  const { type, exportKind, declaration } = node;

  parts.push("export");

  const isDefault = node.default || type === "ExportDefaultDeclaration";
  if (isDefault) {
    parts.push(" default");
  }

  parts.push(printDanglingComments(path, options, /* sameIndent */ true));

  if (needsHardlineAfterDanglingComment(node)) {
    parts.push(hardline);
  }

  if (declaration) {
    parts.push(" ", path.call(print, "declaration"));
    const { type } = declaration;

    if (
      isDefault &&
      type !== "ClassDeclaration" &&
      type !== "FunctionDeclaration" &&
      type !== "TSInterfaceDeclaration" &&
      type !== "DeclareClass" &&
      type !== "DeclareFunction" &&
      type !== "TSDeclareFunction" &&
      type !== "EnumDeclaration"
    ) {
      parts.push(semi);
    }
  } else {
    if (exportKind === "type") {
      parts.push(" type");
    }
    parts.push(
      printModuleSpecifiers(path, options, print),
      printModuleSource(path, options, print),
      printImportAssertions(path, options, print),
      semi
    );
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

function printModuleSource(path, options, print) {
  const node = path.getValue();
  return node.source ? concat([" from ", path.call(print, "source")]) : "";
}

function printModuleSpecifiers(path, options, print) {
  const node = path.getValue();

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
        node.specifiers.some((node) => node.comments);

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

module.exports = {
  printImportDeclaration,
  printExportDeclaration,
  printExportAllDeclaration,
  printModuleSource,
};
