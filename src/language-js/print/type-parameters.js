import { printDanglingComments } from "../../main/comments.js";
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
import { createGroupIdMapper } from "../../common/util.js";
import { shouldHugType } from "./type-annotation.js";
import { isArrowFunctionVariableDeclarator } from "./assignment.js";

const getTypeParametersGroupId = createGroupIdMapper("typeParameters");

async function printTypeParameters(path, options, print, paramsKey) {
  const node = path.getValue();

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
    !isArrowFunctionVariable &&
    (isParameterInTestCall ||
      node[paramsKey].length === 0 ||
      (node[paramsKey].length === 1 &&
        (node[paramsKey][0].type === "NullableTypeAnnotation" ||
          shouldHugType(node[paramsKey][0]))));

  if (shouldInline) {
    return [
      "<",
      join(", ", await path.map(print, paramsKey)),
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
        path.getParentNode().type === "ArrowFunctionExpression"
      ? ","
      : shouldPrintComma(options, "all")
      ? ifBreak(",")
      : "";

  return group(
    [
      "<",
      indent([softline, join([",", line], await path.map(print, paramsKey))]),
      trailingComma,
      softline,
      ">",
    ],
    { id: getTypeParametersGroupId(node) }
  );
}

function printDanglingCommentsForInline(path, options) {
  const node = path.getValue();
  if (!hasComment(node, CommentCheckFlags.Dangling)) {
    return "";
  }
  const hasOnlyBlockComments = !hasComment(node, CommentCheckFlags.Line);
  const printed = printDanglingComments(
    path,
    options,
    /* sameIndent */ hasOnlyBlockComments
  );
  if (hasOnlyBlockComments) {
    return printed;
  }
  return [printed, hardline];
}

async function printTypeParameter(path, options, print) {
  const node = path.getValue();
  const parts = [];
  const parent = path.getParentNode();
  if (parent.type === "TSMappedType") {
    parts.push("[", await print("name"));
    if (node.constraint) {
      parts.push(" in ", await print("constraint"));
    }
    if (parent.nameType) {
      parts.push(" as ", await path.callParent(() => print("nameType")));
    }
    parts.push("]");
    return parts;
  }

  if (node.variance) {
    parts.push(await print("variance"));
  }

  if (node.in) {
    parts.push("in ");
  }

  if (node.out) {
    parts.push("out ");
  }

  parts.push(await print("name"));

  if (node.bound) {
    parts.push(": ", await print("bound"));
  }

  if (node.constraint) {
    parts.push(" extends ", await print("constraint"));
  }

  if (node.default) {
    parts.push(" = ", await print("default"));
  }

  return parts;
}

export { printTypeParameter, printTypeParameters, getTypeParametersGroupId };
