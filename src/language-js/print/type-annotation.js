"use strict";

const { printComments } = require("../../main/comments");
const {
  builders: { concat, group, join, line, softline, indent, align, ifBreak },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const {
  isFlowAnnotationComment,
  isSimpleType,
  isObjectType,
  hasLeadingOwnLineComment,
} = require("../utils");
const { printAssignmentRight } = require("./assignment");

function printTypeAnnotation(path, options, print) {
  const node = path.getValue();
  if (!node.typeAnnotation) {
    return "";
  }

  const parentNode = path.getParentNode();
  const isDefinite =
    node.definite ||
    (parentNode &&
      parentNode.type === "VariableDeclarator" &&
      parentNode.definite);

  const isFunctionDeclarationIdentifier =
    parentNode.type === "DeclareFunction" && parentNode.id === node;

  if (isFlowAnnotationComment(options.originalText, node.typeAnnotation)) {
    return concat([" /*: ", path.call(print, "typeAnnotation"), " */"]);
  }

  return concat([
    isFunctionDeclarationIdentifier ? "" : isDefinite ? "!: " : ": ",
    path.call(print, "typeAnnotation"),
  ]);
}

function shouldHugType(node) {
  if (isSimpleType(node) || isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    const voidCount = node.types.filter(
      (n) =>
        n.type === "VoidTypeAnnotation" ||
        n.type === "TSVoidKeyword" ||
        n.type === "NullLiteralTypeAnnotation" ||
        n.type === "TSNullKeyword"
    ).length;

    const hasObject = node.types.some(
      (n) =>
        n.type === "ObjectTypeAnnotation" ||
        n.type === "TSTypeLiteral" ||
        // This is a bit aggressive but captures Array<{x}>
        n.type === "GenericTypeAnnotation" ||
        n.type === "TSTypeReference"
    );

    if (node.types.length - 1 === voidCount && hasObject) {
      return true;
    }
  }

  return false;
}

function printOpaqueType(path, options, print) {
  const semi = options.semi ? ";" : "";
  const n = path.getValue();
  const parts = [];
  parts.push(
    "opaque type ",
    path.call(print, "id"),
    path.call(print, "typeParameters")
  );

  if (n.supertype) {
    parts.push(": ", path.call(print, "supertype"));
  }

  if (n.impltype) {
    parts.push(" = ", path.call(print, "impltype"));
  }

  parts.push(semi);

  return concat(parts);
}

function printTypeAlias(path, options, print) {
  const semi = options.semi ? ";" : "";
  const n = path.getValue();
  const parts = [];
  if (n.declare) {
    parts.push("declare ");
  }

  const printed = printAssignmentRight(
    n.id,
    n.right,
    path.call(print, "right"),
    options
  );

  parts.push(
    "type ",
    path.call(print, "id"),
    path.call(print, "typeParameters"),
    " =",
    printed,
    semi
  );

  return group(concat(parts));
}

function printIntersectionType(path, options, print) {
  const n = path.getValue();
  const types = path.map(print, "types");
  const result = [];
  let wasIndented = false;
  for (let i = 0; i < types.length; ++i) {
    if (i === 0) {
      result.push(types[i]);
    } else if (isObjectType(n.types[i - 1]) && isObjectType(n.types[i])) {
      // If both are objects, don't indent
      result.push(concat([" & ", wasIndented ? indent(types[i]) : types[i]]));
    } else if (!isObjectType(n.types[i - 1]) && !isObjectType(n.types[i])) {
      // If no object is involved, go to the next line if it breaks
      result.push(indent(concat([" &", line, types[i]])));
    } else {
      // If you go from object to non-object or vis-versa, then inline it
      if (i > 1) {
        wasIndented = true;
      }
      result.push(" & ", i > 1 ? indent(types[i]) : types[i]);
    }
  }
  return group(concat(result));
}

function printUnionType(path, options, print) {
  const n = path.getValue();
  // single-line variation
  // A | B | C

  // multi-line variation
  // | A
  // | B
  // | C

  const parent = path.getParentNode();

  // If there's a leading comment, the parent is doing the indentation
  const shouldIndent =
    parent.type !== "TypeParameterInstantiation" &&
    parent.type !== "TSTypeParameterInstantiation" &&
    parent.type !== "GenericTypeAnnotation" &&
    parent.type !== "TSTypeReference" &&
    parent.type !== "TSTypeAssertion" &&
    parent.type !== "TupleTypeAnnotation" &&
    parent.type !== "TSTupleType" &&
    !(
      parent.type === "FunctionTypeParam" &&
      !parent.name &&
      path.getParentNode(1).this !== parent
    ) &&
    !(
      (parent.type === "TypeAlias" ||
        parent.type === "VariableDeclarator" ||
        parent.type === "TSTypeAliasDeclaration") &&
      hasLeadingOwnLineComment(options.originalText, n)
    );

  // {
  //   a: string
  // } | null | void
  // should be inlined and not be printed in the multi-line variant
  const shouldHug = shouldHugType(n);

  // We want to align the children but without its comment, so it looks like
  // | child1
  // // comment
  // | child2
  const printed = path.map((typePath) => {
    let printedType = typePath.call(print);
    if (!shouldHug) {
      printedType = align(2, printedType);
    }
    return printComments(typePath, () => printedType, options);
  }, "types");

  if (shouldHug) {
    return join(" | ", printed);
  }

  const shouldAddStartLine =
    shouldIndent && !hasLeadingOwnLineComment(options.originalText, n);

  const code = concat([
    ifBreak(concat([shouldAddStartLine ? line : "", "| "])),
    join(concat([line, "| "]), printed),
  ]);

  if (pathNeedsParens(path, options)) {
    return group(concat([indent(code), softline]));
  }

  if (
    (parent.type === "TupleTypeAnnotation" && parent.types.length > 1) ||
    (parent.type === "TSTupleType" && parent.elementTypes.length > 1)
  ) {
    return group(
      concat([
        indent(concat([ifBreak(concat(["(", softline])), code])),
        softline,
        ifBreak(")"),
      ])
    );
  }

  return group(shouldIndent ? indent(code) : code);
}

module.exports = {
  printOpaqueType,
  printTypeAlias,
  printTypeAnnotation,
  printIntersectionType,
  printUnionType,
  shouldHugType,
};
