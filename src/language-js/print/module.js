import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utils/is-non-empty-array.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import { hasSameLoc, locEnd, locStart } from "../loc.js";
import getTextWithoutComments from "../utils/get-text-without-comments.js";
import {
  CommentCheckFlags,
  createTypeCheckFunction,
  hasComment,
  isStringLiteral,
  needsHardlineAfterDanglingComment,
  rawText,
  shouldPrintComma,
} from "../utils/index.js";
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
  "ComponentDeclaration",
  "FunctionDeclaration",
  "TSInterfaceDeclaration",
  "DeclareClass",
  "DeclareComponent",
  "DeclareFunction",
  "DeclareHook",
  "HookDeclaration",
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
  if (shouldPrintSpecifiers(node, options)) {
    parts.push(" from");
  }
  parts.push(" ", print("source"));

  return parts;
}

function printModuleSpecifiers(path, options, print) {
  const { node } = path;

  if (!shouldPrintSpecifiers(node, options)) {
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

function shouldPrintSpecifiers(node, options) {
  if (
    node.type !== "ImportDeclaration" ||
    isNonEmptyArray(node.specifiers) ||
    node.importKind === "type"
  ) {
    return true;
  }

  const text = getTextWithoutComments(
    options,
    locStart(node),
    locStart(node.source),
  );

  return text.trimEnd().endsWith("from");
}

function getImportAttributesKeyword(node, options) {
  // Babel parser add this property to indicate the keyword is `assert`
  if (node.extra?.deprecatedAssertSyntax) {
    return "assert";
  }

  const textBetweenSourceAndAttributes = getTextWithoutComments(
    options,
    locEnd(node.source),
    node.attributes?.[0] ? locStart(node.attributes[0]) : locEnd(node),
  ).trimStart();

  if (textBetweenSourceAndAttributes.startsWith("assert")) {
    return "assert";
  }

  if (textBetweenSourceAndAttributes.startsWith("with")) {
    return "with";
  }

  return isNonEmptyArray(node.attributes) ? "with" : undefined;
}

function printImportAttributes(path, options, print) {
  const { node } = path;

  if (!node.source) {
    return "";
  }

  const keyword = getImportAttributesKeyword(node, options);
  if (!keyword) {
    return "";
  }

  /** @type{Doc[]} */
  const parts = [` ${keyword} {`];

  if (isNonEmptyArray(node.attributes)) {
    if (options.bracketSpacing) {
      parts.push(" ");
    }

    parts.push(join(", ", path.map(print, "attributes")));

    if (options.bracketSpacing) {
      parts.push(" ");
    }
  }
  parts.push("}");

  return parts;
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
  printExportDeclaration,
  printImportDeclaration,
  printImportKind,
  printModuleSpecifier,
};
