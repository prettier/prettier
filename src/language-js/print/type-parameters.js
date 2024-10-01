import {
  group,
  hardline,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  lineSuffixBoundary,
  softline,
} from "../../document/builders.js";
import { printDanglingComments } from "../../main/comments/print.js";
import createGroupIdMapper from "../../utils/create-group-id-mapper.js";
import {
  CommentCheckFlags,
  getFunctionParameters,
  hasComment,
  isObjectType,
  isTestCall,
  shouldPrintComma,
} from "../utils/index.js";
import { isArrowFunctionVariableDeclarator } from "./assignment.js";
import { printTypeScriptMappedTypeModifier } from "./mapped-type.js";
import {
  printTypeAnnotationProperty,
  shouldHugType,
} from "./type-annotation.js";

/**
 * @import {Doc} from "../../document/builders.js"
 * @import AstPath from "../../common/ast-path.js"
 */

const getTypeParametersGroupId = createGroupIdMapper("typeParameters");

// Keep comma if the file extension not `.ts` and
// has one type parameter that isn't extend with any types.
// Because, otherwise formatted result will be invalid as tsx.
function shouldForceTrailingComma(path, options, paramsKey) {
  const { node } = path;
  return (
    getFunctionParameters(node).length === 1 &&
    node.type.startsWith("TS") &&
    !node[paramsKey][0].constraint &&
    path.parent.type === "ArrowFunctionExpression" &&
    !(options.filepath && /\.ts$/u.test(options.filepath))
  );
}

/**
 * @param {AstPath} path
 */
function printTypeParameters(path, options, print, paramsKey) {
  const { node } = path;

  if (!node[paramsKey]) {
    return "";
  }

  // for TypeParameterDeclaration typeParameters is a single node
  if (!Array.isArray(node[paramsKey])) {
    return print(paramsKey);
  }

  const isParameterInTestCall = isTestCall(path.grandparent);

  const isArrowFunctionVariable = path.match(
    (node) =>
      !(node[paramsKey].length === 1 && isObjectType(node[paramsKey][0])),
    undefined,
    (node, name) => name === "typeAnnotation",
    (node) => node.type === "Identifier",
    isArrowFunctionVariableDeclarator,
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

  const trailingComma =
    node.type === "TSTypeParameterInstantiation" // https://github.com/microsoft/TypeScript/issues/21984
      ? ""
      : shouldForceTrailingComma(path, options, paramsKey)
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
    { id: getTypeParametersGroupId(node) },
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
   * @type {Doc[]}
   */
  const parts = [node.type === "TSTypeParameter" && node.const ? "const " : ""];

  const name = node.type === "TSTypeParameter" ? print("name") : node.name;

  if (parent.type === "TSMappedType") {
    if (parent.readonly) {
      parts.push(
        printTypeScriptMappedTypeModifier(parent.readonly, "readonly"),
        " ",
      );
    }
    parts.push("[", name);
    if (node.constraint) {
      parts.push(" in ", print("constraint"));
    }
    if (parent.nameType) {
      parts.push(
        " as ",
        path.callParent(() => print("nameType")),
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
    const groupId = Symbol("constraint");
    parts.push(
      " extends",
      group(indent(line), { id: groupId }),
      lineSuffixBoundary,
      indentIfBreak(print("constraint"), { groupId }),
    );
  }

  if (node.default) {
    parts.push(" = ", print("default"));
  }

  return group(parts);
}

export { getTypeParametersGroupId, printTypeParameter, printTypeParameters };
