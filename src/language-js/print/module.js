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
  /** @type{Doc[]} */
  return [
    "import",
    node.module ? " module" : "",
    node.phase ? ` ${node.phase}` : "",
    printImportKind(node),
    printModuleSpecifiers(path, options, print),
    printModuleSource(path, options, print),
    printImportAttributes(path, options, print),
    options.semi ? ";" : "",
  ];
}

const isDefaultExport = (node) =>
  node.type === "ExportDefaultDeclaration" ||
  (node.type === "DeclareExportDeclaration" && node.default);

/*
- `ExportDefaultDeclaration`
- `ExportNamedDeclaration`
- `DeclareExportDeclaration`(flow)
- `ExportAllDeclaration`
- `DeclareExportAllDeclaration`(flow)
*/
function printExportDeclaration(path, options, print) {
  const { node } = path;

  /** @type{Doc[]} */
  const parts = [
    printDecoratorsBeforeExport(path, options, print),
    printDeclareToken(path),
    "export",
    isDefaultExport(node) ? " default" : "",
  ];

  const { declaration, exported } = node;

  if (hasComment(node, CommentCheckFlags.Dangling)) {
    parts.push(" ", printDanglingComments(path, options));

    if (needsHardlineAfterDanglingComment(node)) {
      parts.push(hardline);
    }
  }

  if (declaration) {
    parts.push(" ", print("declaration"));
  } else {
    parts.push(printExportKind(node));

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
      printImportAttributes(path, options, print),
    );
  }

  parts.push(printSemicolonAfterExportDeclaration(node, options));

  return parts;
}

const shouldOmitSemicolon = createTypeCheckFunction([
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
      (isDefaultExport(node) && !shouldOmitSemicolon(node.declaration)))
  ) {
    return ";";
  }

  return "";
}

function printImportOrExportKind(kind, spaceBeforeKind = true) {
  return kind && kind !== "value"
    ? `${spaceBeforeKind ? " " : ""}${kind}${spaceBeforeKind ? "" : " "}`
    : "";
}

function printImportKind(node, spaceBeforeKind) {
  return printImportOrExportKind(node.importKind, spaceBeforeKind);
}

function printExportKind(node) {
  return printImportOrExportKind(node.exportKind);
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
          ]),
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
    options.originalText.slice(locStart(node), locStart(source)),
  );
}

/**
 * Print Import Attributes syntax.
 * If old ImportAssertions syntax is used, print them here.
 */
function printImportAttributes(path, options, print) {
  const { node } = path;

  const property = isNonEmptyArray(node.attributes)
    ? "attributes"
    : isNonEmptyArray(node.assertions)
      ? "assertions"
      : undefined;

  if (!property) {
    return "";
  }

  const keyword =
    property === "assertions" || node.extra?.deprecatedAssertSyntax
      ? "assert"
      : "with";
  return [
    ` ${keyword} {`,
    options.bracketSpacing ? " " : "",
    join(", ", path.map(print, property)),
    options.bracketSpacing ? " " : "",
    "}",
  ];
}

function printModuleSpecifier(path, options, print) {
  const { node } = path;
  const { type } = node;

  const isImportSpecifier = type.startsWith("Import");
  const leftSideProperty = isImportSpecifier ? "imported" : "local";
  const rightSideProperty = isImportSpecifier ? "local" : "exported";
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

  return [
    printImportOrExportKind(
      type === "ImportSpecifier" ? node.importKind : node.exportKind,
      /* spaceBeforeKind */ false,
    ),
    left,
    left && right ? " as " : "",
    right,
  ];
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

export {
  printImportDeclaration,
  printExportDeclaration,
  printModuleSpecifier,
  printImportKind,
};
