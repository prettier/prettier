import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  removeLines,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { locEnd, locStart } from "../loc.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import getTextWithoutComments from "../utilities/get-text-without-comments.js";
import { isShorthandSpecifier } from "../utilities/is-shorthand-specifier.js";
import { needsHardlineAfterDanglingComment } from "../utilities/needs-hardline-after-dangling-comment.js";
import { isStringLiteral } from "../utilities/node-types.js";
import { printDecoratorsBeforeExport } from "./decorators.js";
import { printDeclareToken, printTrailingComma } from "./miscellaneous.js";
import { printObject } from "./object.js";

/**
 * @import {Doc} from "../../document/index.js"
 */

/*
- `ImportDeclaration`
*/
function printImportDeclaration(path, options, print) {
  const { node } = path;
  /** @type{Doc[]} */
  return [
    "import",
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
- `ExportAllDeclaration`
- `DeclareExportDeclaration`(flow)
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

  return [
    shouldPrintSpecifiers(node, options) ? " from" : "",
    " ",
    print("source"),
  ];
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
            ifBreak(printTrailingComma(options)),
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

const isSingleTypeImportAttributes = (node) => {
  const { attributes } = node;

  if (attributes.length !== 1) {
    return false;
  }

  const [attribute] = attributes;
  const { type, key, value } = attribute;
  return (
    type === "ImportAttribute" &&
    ((key.type === "Identifier" && key.name === "type") ||
      (isStringLiteral(key) && key.value === "type")) &&
    isStringLiteral(value) &&
    !hasComment(attribute) &&
    !hasComment(key) &&
    !hasComment(value)
  );
};

/*
- `ImportDeclaration`
- `ExportDefaultDeclaration`
- `ExportNamedDeclaration`
- `ExportAllDeclaration`
- `DeclareExportDeclaration` (Flow)
- `DeclareExportAllDeclaration` (Flow)
*/
function printImportAttributes(path, options, print) {
  const { node } = path;

  if (!node.source) {
    return "";
  }

  const keyword = getImportAttributesKeyword(node, options);
  if (!keyword) {
    return "";
  }

  let attributesDoc = printObject(path, options, print);
  if (isSingleTypeImportAttributes(node)) {
    attributesDoc = removeLines(attributesDoc);
  }

  return [` ${keyword} `, attributesDoc];
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

export {
  printExportDeclaration,
  printImportDeclaration,
  printImportKind,
  printModuleSpecifier,
};
