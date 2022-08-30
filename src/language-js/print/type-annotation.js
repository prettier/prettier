import { printComments, printDanglingComments } from "../../main/comments.js";
import { isNonEmptyArray } from "../../common/util.js";
import {
  group,
  join,
  line,
  softline,
  indent,
  align,
  ifBreak,
} from "../../document/builders.js";
import pathNeedsParens from "../needs-parens.js";
import { locStart } from "../loc.js";
import {
  isSimpleType,
  isObjectType,
  hasLeadingOwnLineComment,
  isObjectTypePropertyAFunction,
  shouldPrintComma,
} from "../utils/index.js";
import { printAssignment } from "./assignment.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printArrayItems } from "./array.js";

function shouldHugType(node) {
  if (isSimpleType(node) || isObjectType(node)) {
    return true;
  }

  if (node.type === "UnionTypeAnnotation" || node.type === "TSUnionType") {
    const voidCount = node.types.filter(
      (node) =>
        node.type === "VoidTypeAnnotation" ||
        node.type === "TSVoidKeyword" ||
        node.type === "NullLiteralTypeAnnotation" ||
        node.type === "TSNullKeyword"
    ).length;

    const hasObject = node.types.some(
      (node) =>
        node.type === "ObjectTypeAnnotation" ||
        node.type === "TSTypeLiteral" ||
        // This is a bit aggressive but captures Array<{x}>
        node.type === "GenericTypeAnnotation" ||
        node.type === "TSTypeReference"
    );

    if (node.types.length - 1 === voidCount && hasObject) {
      return true;
    }
  }

  return false;
}

function printOpaqueType(path, options, print) {
  const semi = options.semi ? ";" : "";
  const node = path.getValue();
  const parts = [];
  parts.push("opaque type ", print("id"), print("typeParameters"));

  if (node.supertype) {
    parts.push(": ", print("supertype"));
  }

  if (node.impltype) {
    parts.push(" = ", print("impltype"));
  }

  parts.push(semi);

  return parts;
}

function printTypeAlias(path, options, print) {
  const semi = options.semi ? ";" : "";
  const node = path.getValue();
  const parts = [];
  if (node.declare) {
    parts.push("declare ");
  }
  parts.push("type ", print("id"), print("typeParameters"));
  const rightPropertyName =
    node.type === "TSTypeAliasDeclaration" ? "typeAnnotation" : "right";
  return [
    printAssignment(path, options, print, parts, " =", rightPropertyName),
    semi,
  ];
}

// `TSIntersectionType` and `IntersectionTypeAnnotation`
function printIntersectionType(path, options, print) {
  const node = path.getValue();
  const types = path.map(print, "types");
  const result = [];
  let wasIndented = false;
  for (let i = 0; i < types.length; ++i) {
    if (i === 0) {
      result.push(types[i]);
    } else if (isObjectType(node.types[i - 1]) && isObjectType(node.types[i])) {
      // If both are objects, don't indent
      result.push([" & ", wasIndented ? indent(types[i]) : types[i]]);
    } else if (
      !isObjectType(node.types[i - 1]) &&
      !isObjectType(node.types[i])
    ) {
      // If no object is involved, go to the next line if it breaks
      result.push(indent([" &", line, types[i]]));
    } else {
      // If you go from object to non-object or vis-versa, then inline it
      if (i > 1) {
        wasIndented = true;
      }
      result.push(" & ", i > 1 ? indent(types[i]) : types[i]);
    }
  }
  return group(result);
}

// `TSUnionType` and `UnionTypeAnnotation`
function printUnionType(path, options, print) {
  const node = path.getValue();
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
      hasLeadingOwnLineComment(options.originalText, node)
    );

  // {
  //   a: string
  // } | null | void
  // should be inlined and not be printed in the multi-line variant
  const shouldHug = shouldHugType(node);

  // We want to align the children but without its comment, so it looks like
  // | child1
  // // comment
  // | child2
  const printed = path.map((typePath) => {
    let printedType = print();
    if (!shouldHug) {
      printedType = align(2, printedType);
    }
    return printComments(typePath, printedType, options);
  }, "types");

  if (shouldHug) {
    return join(" | ", printed);
  }

  const shouldAddStartLine =
    shouldIndent && !hasLeadingOwnLineComment(options.originalText, node);

  const code = [
    ifBreak([shouldAddStartLine ? line : "", "| "]),
    join([line, "| "], printed),
  ];

  if (pathNeedsParens(path, options)) {
    return group([indent(code), softline]);
  }

  if (
    (parent.type === "TupleTypeAnnotation" && parent.types.length > 1) ||
    (parent.type === "TSTupleType" && parent.elementTypes.length > 1)
  ) {
    return group([
      indent([ifBreak(["(", softline]), code]),
      softline,
      ifBreak(")"),
    ]);
  }

  return group(shouldIndent ? indent(code) : code);
}

// `TSFunctionType` and `FunctionTypeAnnotation`
function printFunctionType(path, options, print) {
  const node = path.getValue();
  const parts = [];
  // FunctionTypeAnnotation is ambiguous:
  // declare function foo(a: B): void; OR
  // var A: (a: B) => void;
  const parent = path.getParentNode(0);
  const parentParent = path.getParentNode(1);
  const parentParentParent = path.getParentNode(2);
  let isArrowFunctionTypeAnnotation =
    node.type === "TSFunctionType" ||
    !(
      ((parent.type === "ObjectTypeProperty" ||
        parent.type === "ObjectTypeInternalSlot") &&
        !parent.variance &&
        !parent.optional &&
        locStart(parent) === locStart(node)) ||
      parent.type === "ObjectTypeCallProperty" ||
      (parentParentParent && parentParentParent.type === "DeclareFunction")
    );

  let needsColon =
    isArrowFunctionTypeAnnotation &&
    (parent.type === "TypeAnnotation" || parent.type === "TSTypeAnnotation");

  // Sadly we can't put it inside of AstPath::needsColon because we are
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

  const parametersDoc = printFunctionParameters(
    path,
    print,
    options,
    /* expandArg */ false,
    /* printTypeParams */ true
  );

  // The returnType is not wrapped in a TypeAnnotation, so the colon
  // needs to be added separately.
  const returnTypeDoc =
    node.returnType || node.predicate || node.typeAnnotation
      ? [
          isArrowFunctionTypeAnnotation ? " => " : ": ",
          node.returnType ? print("returnType") : "",
          node.predicate ? print("predicate") : "",
          node.typeAnnotation ? print("typeAnnotation") : "",
        ]
      : "";

  const shouldGroupParameters = shouldGroupFunctionParameters(
    node,
    returnTypeDoc
  );

  parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

  if (returnTypeDoc) {
    parts.push(returnTypeDoc);
  }

  if (needsParens) {
    parts.push(")");
  }

  return group(parts);
}

// `TSTupleType` and `TupleTypeAnnotation`
function printTupleType(path, options, print) {
  const node = path.getValue();
  const typesField = node.type === "TSTupleType" ? "elementTypes" : "types";
  const types = node[typesField];
  const isNonEmptyTuple = isNonEmptyArray(types);
  const bracketsDelimiterLine = isNonEmptyTuple ? softline : "";
  return group([
    "[",
    indent([
      bracketsDelimiterLine,
      printArrayItems(path, options, typesField, print),
    ]),
    ifBreak(isNonEmptyTuple && shouldPrintComma(options, "all") ? "," : ""),
    printDanglingComments(path, options, /* sameIndent */ true),
    bracketsDelimiterLine,
    "]",
  ]);
}

// `TSIndexedAccessType`, `IndexedAccessType`, and `OptionalIndexedAccessType`
function printIndexedAccessType(path, options, print) {
  const node = path.getValue();
  const leftDelimiter =
    node.type === "OptionalIndexedAccessType" && node.optional ? "?.[" : "[";
  return [print("objectType"), leftDelimiter, print("indexType"), "]"];
}

// `TSJSDocNullableType`, `TSJSDocNonNullableType`
function printJSDocType(path, print, token) {
  const node = path.getValue();
  return [
    node.postfix ? "" : token,
    print("typeAnnotation"),
    node.postfix ? token : "",
  ];
}

export {
  printOpaqueType,
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  printIndexedAccessType,
  shouldHugType,
  printJSDocType,
};
