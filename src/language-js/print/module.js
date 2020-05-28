"use strict";

const {
  builders: { concat, softline, group, indent, join, line, ifBreak },
} = require("../../document");
const { shouldPrintComma } = require("../utils");

function printModuleSource(path, options, print) {
  const node = path.getValue();
  return node.source ? concat([" from ", path.call(print, "source")]) : "";
}

function printModuleSpecifiers(path, options, print) {
  const node = path.getValue();
  const parts = [
    node.type === "ImportDeclaration" ? " " : "",
    node.exportKind === "type" ? "type " : "",
  ];

  const standalonesSpecifiers = [];
  const groupedSpecifiers = [];

  if (node.specifiers && node.specifiers.length > 0) {
    path.each((specifierPath) => {
      const specifierType = path.getValue().type;
      if (
        specifierType === "ExportNamespaceSpecifier" ||
        specifierType === "ExportDefaultSpecifier" ||
        specifierType === "ImportNamespaceSpecifier" ||
        specifierType === "ImportDefaultSpecifier"
      ) {
        standalonesSpecifiers.push(print(specifierPath));
      } else if (
        specifierType === "ExportSpecifier" ||
        specifierType === "ImportSpecifier"
      ) {
        groupedSpecifiers.push(print(specifierPath));
      } else {
        throw new Error(
          `Unknown specifier type ${JSON.stringify(specifierType)}`
        );
      }
    }, "specifiers");

    parts.push(join(", ", standalonesSpecifiers));

    const canBreak =
      groupedSpecifiers.length > 1 ||
      standalonesSpecifiers.length > 0 ||
      (node.specifiers && node.specifiers.some((node) => node.comments));

    if (groupedSpecifiers.length !== 0) {
      if (standalonesSpecifiers.length !== 0) {
        parts.push(", ");
      }

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

module.exports = {
  printModuleSource,
  printModuleSpecifiers,
};
