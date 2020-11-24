"use strict";

const { printComments, printDanglingComments } = require("../../main/comments");
const { getLast } = require("../../common/util");
const {
  builders: { concat, group, join, line, softline, indent, align, ifBreak },
} = require("../../document");
const pathNeedsParens = require("../needs-parens");
const { locStart } = require("../loc");
const {
  isFlowAnnotationComment,
  isSimpleType,
  isObjectType,
  hasLeadingOwnLineComment,
  isObjectTypePropertyAFunction,
  shouldPrintComma,
} = require("../utils");
const { printAssignmentRight } = require("./assignment");
const { printFunctionParameters } = require("./function-parameters");
const { printArrayItems } = require("./array");

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

// `TSIntersectionType` and `IntersectionTypeAnnotation`
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

// `TSUnionType` and `UnionTypeAnnotation`
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

// `TSFunctionType` and `FunctionTypeAnnotation`
function printFunctionType(path, options, print) {
  const n = path.getValue();
  const parts = [];
  // FunctionTypeAnnotation is ambiguous:
  // declare function foo(a: B): void; OR
  // var A: (a: B) => void;
  const parent = path.getParentNode(0);
  const parentParent = path.getParentNode(1);
  const parentParentParent = path.getParentNode(2);
  let isArrowFunctionTypeAnnotation =
    n.type === "TSFunctionType" ||
    !(
      ((parent.type === "ObjectTypeProperty" ||
        parent.type === "ObjectTypeInternalSlot") &&
        !parent.variance &&
        !parent.optional &&
        locStart(parent) === locStart(n)) ||
      parent.type === "ObjectTypeCallProperty" ||
      (parentParentParent && parentParentParent.type === "DeclareFunction")
    );

  let needsColon =
    isArrowFunctionTypeAnnotation &&
    (parent.type === "TypeAnnotation" || parent.type === "TSTypeAnnotation");

  // Sadly we can't put it inside of FastPath::needsColon because we are
  // printing ":" as part of the expression and it would put parenthesis
  // around :(
  const needsParens =
    needsColon &&
    isArrowFunctionTypeAnnotation &&
    (parent.type === "TypeAnnotation" || parent.type === "TSTypeAnnotation") &&
    parentParent.type === "ArrowFunctionExpression";

  if (isObjectTypePropertyAFunction(parent)) {
    isArrowFunctionTypeAnnotation = true;
    needsColon = true;
  }

  if (needsParens) {
    parts.push("(");
  }

  parts.push(
    printFunctionParameters(
      path,
      print,
      options,
      /* expandArg */ false,
      /* printTypeParams */ true
    )
  );

  // The returnType is not wrapped in a TypeAnnotation, so the colon
  // needs to be added separately.
  if (n.returnType || n.predicate || n.typeAnnotation) {
    parts.push(
      isArrowFunctionTypeAnnotation ? " => " : ": ",
      path.call(print, "returnType"),
      path.call(print, "predicate"),
      path.call(print, "typeAnnotation")
    );
  }
  if (needsParens) {
    parts.push(")");
  }

  return group(concat(parts));
}

// `TSTupleType` and `TupleTypeAnnotation`
function printTupleType(path, options, print) {
  const n = path.getValue();
  const typesField = n.type === "TSTupleType" ? "elementTypes" : "types";
  const hasRest =
    n[typesField].length > 0 && getLast(n[typesField]).type === "TSRestType";
  return group(
    concat([
      "[",
      indent(
        concat([softline, printArrayItems(path, options, typesField, print)])
      ),
      ifBreak(shouldPrintComma(options, "all") && !hasRest ? "," : ""),
      printDanglingComments(path, options, /* sameIndent */ true),
      softline,
      "]",
    ])
  );
}

module.exports = {
  printOpaqueType,
  printTypeAlias,
  printTypeAnnotation,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  shouldHugType,
};
