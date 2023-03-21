import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import {
  softline,
  group,
  indent,
  join,
  line,
  ifBreak,
  hardline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";

import {
  hasComment,
  CommentCheckFlags,
  shouldPrintComma,
  needsHardlineAfterDanglingComment,
  isStringLiteral,
  rawText,
  createTypeCheckFunction,
} from "../utils/index.js";
import { locStart, hasSameLoc } from "../loc.js";
import { printDecoratorsBeforeExport } from "./decorators.js";
import { printDeclareToken } from "./misc.js";

/**
 * @typedef {import("../../document/builders.js").Doc} Doc
 */

function printImportDeclaration(path, options, print) {
  const { node } = path;
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  const parts = [];

  const { importKind } = node;

  parts.push("import");

  if (node.module) {
    parts.push(" module");
  }

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

/*
- `ExportDefaultDeclaration`
- `ExportNamedDeclaration`
- `DeclareExportDeclaration`(flow)
- `ExportAllDeclaration`
- `DeclareExportAllDeclaration`(flow)
*/
function printExportDeclaration(path, options, print) {
  /** @type{Doc[]} */
  const parts = [
    printDecoratorsBeforeExport(path, options, print),
    printDeclareToken(path),
    "export",
  ];

  const { node } = path;
  const { type, exportKind, declaration, exported } = node;

  if (node.default || type === "ExportDefaultDeclaration") {
    parts.push(" default");
  }

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(" ", printDanglingComments(path, options));

    if (needsHardlineAfterDanglingComment(node)) {
      parts.push(hardline);
    }
  }

  if (declaration) {
    parts.push(" ", print("declaration"));
  } else {
    parts.push(exportKind === "type" ? " type" : "");

    if (
      node.type === "ExportAllDeclaration" ||
      node.type === "DeclareExportAllDeclaration"
    ) {
      parts.push(" *");
      if (exported) {
        parts.push(" as ", print("exported"));
      }
    } else {
      parts.push(printModuleSpecifiers(path, options, print));
    }

    parts.push(
      printModuleSource(path, options, print),
      printImportAssertions(path, options, print)
    );
  }

  parts.push(printSemicolonAfterExportDeclaration(node, options));

  return parts;
}

const canOmitSemicolon = createTypeCheckFunction([
  "ClassDeclaration",
  "FunctionDeclaration",
  "TSInterfaceDeclaration",
  "DeclareClass",
  "DeclareFunction",
  "TSDeclareFunction",
  "EnumDeclaration",
]);
function printSemicolonAfterExportDeclaration(node, options) {
  if (
    options.semi &&
    (!node.declaration ||
      ((node.default || node.type === "ExportDefaultDeclaration") &&
        !canOmitSemicolon(node.declaration)))
  ) {
    return ";";
  }

  return "";
}

function printModuleSource(path, options, print) {
  const { node } = path;

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
  const { node } = path;

  if (shouldNotPrintSpecifiers(node, options)) {
    return "";
  }

  /** @type{Doc[]} */
  const parts = [" "];

  if (isNonEmptyArray(node.specifiers)) {
    const standaloneSpecifiers = [];
    const groupedSpecifiers = [];

    path.each(() => {
      const specifierType = path.node.type;
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
        /* c8 ignore next 3 */
        throw new UnexpectedNodeError(node, "specifier");
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
  const { node } = path;
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
  const { node } = path;

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
      /* c8 ignore next */
      return false;
  }
}

export { printImportDeclaration, printExportDeclaration, printModuleSpecifier };
