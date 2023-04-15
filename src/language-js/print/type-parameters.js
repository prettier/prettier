import { printDanglingComments } from "../../main/comments/print.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  indent,
  ifBreak,
} from "../../document/builders.js";
import {
  isTestCall,
  hasComment,
  CommentCheckFlags,
  isTSXFile,
  shouldPrintComma,
  getFunctionParameters,
  isObjectType,
} from "../utils/index.js";
import createGroupIdMapper from "../../utils/create-group-id-mapper.js";
import {
  printTypeAnnotationProperty,
  shouldHugType,
} from "./type-annotation.js";
import { isArrowFunctionVariableDeclarator } from "./assignment.js";
import { printTypeScriptMappedTypeModifier } from "./mapped-type.js";

const getTypeParametersGroupId = createGroupIdMapper("typeParameters");

function printTypeParameters(path, options, print, paramsKey) {
  const { node } = path;

  if (!node[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(node[paramsKey])) {
    return print(paramsKey);
  }

  const grandparent = path.getNode(2);
  const isParameterInTestCall = grandparent && isTestCall(grandparent);

  const isArrowFunctionVariable = path.match(
    (node) =>
      !(node[paramsKey].length === 1 && isObjectType(node[paramsKey][0])),
    undefined,
    (node, name) => name === "typeAnnotation",
    (node) => node.type === "Identifier",
    isArrowFunctionVariableDeclarator
  );

  const shouldInline =
    node[paramsKey].length === 0 ||
    (!isArrowFunctionVariable &&
      (isParameterInTestCall ||
        (node[paramsKey].length === 1 &&
          (node[paramsKey][0].type === "NullableTypeAnnotation" ||
            shouldHugType(node[paramsKey][0])))));

  if (shouldInline) {
    return [
      "<",
      join(", ", path.map(print, paramsKey)),
      printDanglingCommentsForInline(path, options),
      ">",
    ];
  }

  // Keep comma if the file extension is .tsx and
  // has one type parameter that isn't extend with any types.
  // Because, otherwise formatted result will be invalid as tsx.
  const trailingComma =
    node.type === "TSTypeParameterInstantiation" // https://github.com/microsoft/TypeScript/issues/21984
      ? ""
      : getFunctionParameters(node).length === 1 &&
        isTSXFile(options) &&
        !node[paramsKey][0].constraint &&
        path.parent.type === "ArrowFunctionExpression"
      ? ","
      : shouldPrintComma(options)
      ? ifBreak(",")
      : "";

  return group(
    [
      "<",
      indent([softline, join([",", line], path.map(print, paramsKey))]),
      trailingComma,
      softline,
      ">",
    ],
    { id: getTypeParametersGroupId(node) }
  );
}

function printDanglingCommentsForInline(path, options) {
  const { node } = path;
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return "";
  }
  const hasOnlyBlockComments = !hasComment(node, CommentCheckFlags.Line);
  const printed = printDanglingComments(path, options, {
    indent: !hasOnlyBlockComments,
  });
  if (hasOnlyBlockComments) {
    return printed;
  }
  return [printed, hardline];
}

function printTypeParameter(path, options, print) {
  const { node, parent } = path;

  /**
   * @type {import("../../document/builders.js").Doc[]}
   */
  const parts = [node.type === "TSTypeParameter" && node.const ? "const " : ""];

  const name = node.type === "TSTypeParameter" ? print("name") : node.name;

  if (parent.type === "TSMappedType") {
    if (parent.readonly) {
      parts.push(
        printTypeScriptMappedTypeModifier(parent.readonly, "readonly"),
        " "
      );
    }
    parts.push("[", name);
    if (node.constraint) {
      parts.push(" in ", print("constraint"));
    }
    if (parent.nameType) {
      parts.push(
        " as ",
        path.callParent(() => print("nameType"))
      );
    }
    parts.push("]");
    return parts;
  }

  if (node.variance) {
    parts.push(print("variance"));
  }

  if (node.in) {
    parts.push("in ");
  }

  if (node.out) {
    parts.push("out ");
  }

  parts.push(name);

  if (node.bound) {
    if (node.usesExtendsBound) {
      parts.push(" extends ");
    }

    parts.push(printTypeAnnotationProperty(path, print, "bound"));
  }

  if (node.constraint) {
    parts.push(" extends", indent([line, print("constraint")]));
  }

  if (node.default) {
    parts.push(" = ", print("default"));
  }

  return group(parts);
}

export { printTypeParameter, printTypeParameters, getTypeParametersGroupId };
