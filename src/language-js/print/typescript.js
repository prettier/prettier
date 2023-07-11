import {
  join,
  softline,
  group,
  indent,
  conditionalGroup,
  ifBreak,
} from "../../document/builders.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import {
  isStringLiteral,
  shouldPrintComma,
  isCallExpression,
  isMemberExpression,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
} from "../utils/index.js";
import isTsKeywordType from "../utils/is-ts-keyword-type.js";
import { locStart } from "../loc.js";

import {
  printOptionalToken,
  printDeclareToken,
  printTypeScriptAccessibilityToken,
} from "./misc.js";
import { printTernary } from "./ternary.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printTemplateLiteral } from "./template-literal.js";
import { printArray } from "./array.js";
import { printObject } from "./object.js";
import { printClassProperty, printClassMethod } from "./class.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printPropertyKey } from "./property.js";
import { printFunction, printMethodValue } from "./function.js";
import { printInterface } from "./interface.js";
import { printBlock } from "./block.js";
import {
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printIndexedAccessType,
  printInferType,
  printJSDocType,
  printRestType,
  printNamedTupleMember,
  printTypeAnnotation,
  printTypeAnnotationProperty,
  printArrayType,
  printTypeQuery,
  printTypePredicate,
} from "./type-annotation.js";
import { printEnumDeclaration, printEnumMember } from "./enum.js";
import { printImportKind } from "./module.js";
import { printTypescriptMappedType } from "./mapped-type.js";

function printTypescript(path, options, print) {
  const { node } = path;

  // TypeScript nodes always starts with `TS`
  if (!node.type.startsWith("TS")) {
    return;
  }

  if (isTsKeywordType(node)) {
    // TS keyword types stars with `TS`, ends with `Keyword`
    return node.type.slice(2, -7).toLowerCase();
  }

  const semi = options.semi ? ";" : "";
  const parts = [];

  switch (node.type) {
    case "TSThisType":
      return "this";
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        isArrayOrTupleExpression(node.expression) ||
        isObjectOrRecordExpression(node.expression)
      );

      const castGroup = group([
        "<",
        indent([softline, print("typeAnnotation")]),
        softline,
        ">",
      ]);

      const exprContents = [
        ifBreak("("),
        indent([softline, print("expression")]),
        softline,
        ifBreak(")"),
      ];

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          [castGroup, print("expression")],
          [castGroup, group(exprContents, { shouldBreak: true })],
          [castGroup, print("expression")],
        ]);
      }
      return group([castGroup, print("expression")]);
    }
    case "TSDeclareFunction":
      return printFunction(path, print, options);
    case "TSExportAssignment":
      return ["export = ", print("expression"), semi];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration":
      return printTypeAlias(path, options, print);
    case "TSQualifiedName":
      return [print("left"), ".", print("right")];
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "TSAbstractAccessorProperty":
    case "TSAbstractPropertyDefinition":
      return printClassProperty(path, options, print);
    case "TSInterfaceHeritage":
    case "TSClassImplements":
    case "TSExpressionWithTypeArguments": // Babel AST
    case "TSInstantiationExpression":
      return [print("expression"), print("typeParameters")];
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return printNamedTupleMember(path, options, print);
    case "TSRestType":
      return printRestType(path, options, print);
    case "TSOptionalType":
      return [print("typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");
    case "TSTypeParameter":
      return printTypeParameter(path, options, print);
    case "TSAsExpression":
    case "TSSatisfiesExpression": {
      const operator = node.type === "TSAsExpression" ? "as" : "satisfies";
      parts.push(print("expression"), ` ${operator} `, print("typeAnnotation"));
      const { parent } = path;
      if (
        (isCallExpression(parent) && parent.callee === node) ||
        (isMemberExpression(parent) && parent.object === node)
      ) {
        return group([indent([softline, ...parts]), softline]);
      }
      return parts;
    }
    case "TSArrayType":
      return printArrayType(print);
    case "TSPropertySignature":
      return [
        node.readonly ? "readonly " : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        printTypeAnnotationProperty(path, print),
      ];

    case "TSParameterProperty":
      return [
        printTypeScriptAccessibilityToken(node),
        node.static ? "static " : "",
        node.override ? "override " : "",
        node.readonly ? "readonly " : "",
        print("parameter"),
      ];

    case "TSTypeQuery":
      return printTypeQuery(path, print);
    case "TSIndexSignature": {
      // The typescript parser accepts multiple parameters here. If you're
      // using them, it makes sense to have a trailing comma. But if you
      // aren't, this is more like a computed property name than an array.
      // So we leave off the trailing comma when there's just one parameter.
      const trailingComma =
        node.parameters.length > 1
          ? ifBreak(shouldPrintComma(options) ? "," : "")
          : "";

      const parametersGroup = group([
        indent([
          softline,
          join([", ", softline], path.map(print, "parameters")),
        ]),
        trailingComma,
        softline,
      ]);

      const isClassMember =
        path.parent.type === "ClassBody" && path.key === "body";

      return [
        // `static` only allowed in class member
        isClassMember && node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        "[",
        node.parameters ? parametersGroup : "",
        "]",
        printTypeAnnotationProperty(path, print),
        isClassMember ? semi : "",
      ];
    }
    case "TSTypePredicate":
      return printTypePredicate(path, print);
    case "TSNonNullExpression":
      return [print("expression"), "!"];
    case "TSImportType":
      return [
        !node.isTypeOf ? "" : "typeof ",
        "import(",
        print("argument"),
        ")",
        !node.qualifier ? "" : [".", print("qualifier")],
        printTypeParameters(
          path,
          options,
          print,
          node.typeArguments ? "typeArguments" : "typeParameters",
        ),
      ];
    case "TSLiteralType":
      return print("literal");
    case "TSIndexedAccessType":
      return printIndexedAccessType(path, options, print);

    case "TSTypeOperator":
      return [node.operator, " ", print("typeAnnotation")];

    case "TSMappedType":
      return printTypescriptMappedType(path, options, print);

    case "TSMethodSignature": {
      const kind = node.kind && node.kind !== "method" ? `${node.kind} ` : "";
      parts.push(
        printTypeScriptAccessibilityToken(node),
        kind,
        node.computed ? "[" : "",
        print("key"),
        node.computed ? "]" : "",
        printOptionalToken(path),
      );

      const parametersDoc = printFunctionParameters(
        path,
        print,
        options,
        /* expandArg */ false,
        /* printTypeParams */ true,
      );

      const returnTypePropertyName = node.returnType
        ? "returnType"
        : "typeAnnotation";
      const returnTypeNode = node[returnTypePropertyName];
      const returnTypeDoc = returnTypeNode
        ? printTypeAnnotationProperty(path, print, returnTypePropertyName)
        : "";
      const shouldGroupParameters = shouldGroupFunctionParameters(
        node,
        returnTypeDoc,
      );

      parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

      if (returnTypeNode) {
        parts.push(group(returnTypeDoc));
      }

      return group(parts);
    }
    case "TSNamespaceExportDeclaration":
      return ["export as namespace ", print("id"), options.semi ? ";" : ""];
    case "TSEnumDeclaration":
      return printEnumDeclaration(path, print, options);

    case "TSEnumMember":
      return printEnumMember(path, print);

    case "TSImportEqualsDeclaration":
      return [
        node.isExport ? "export " : "",
        "import ",
        printImportKind(node, /* spaceBeforeKind */ false),
        print("id"),
        " = ",
        print("moduleReference"),
        options.semi ? ";" : "",
      ];
    case "TSExternalModuleReference":
      return ["require(", print("expression"), ")"];
    case "TSModuleDeclaration": {
      const { parent } = path;
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration = node.body?.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        parts.push(printDeclareToken(path));

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobal =
          node.kind === "global" ||
          // TODO: Use `node.kind` when babel update AST
          // https://github.com/typescript-eslint/typescript-eslint/pull/6443
          node.global;

        if (!isGlobal) {
          const kind =
            node.kind ??
            // TODO: Use `node.kind` when babel update AST
            (isStringLiteral(node.id) ||
            /(?:^|\s)module(?:\s|$)/.test(
              options.originalText.slice(locStart(node), locStart(node.id)),
            )
              ? "module"
              : "namespace");
          parts.push(kind, " ");
        }
      }

      parts.push(print("id"));

      if (bodyIsDeclaration) {
        parts.push(print("body"));
      } else if (node.body) {
        parts.push(" ", group(print("body")));
      } else {
        parts.push(semi);
      }

      return parts;
    }

    case "TSConditionalType":
      return printTernary(path, options, print);

    case "TSInferType":
      return printInferType(path, options, print);
    case "TSIntersectionType":
      return printIntersectionType(path, options, print);
    case "TSUnionType":
      return printUnionType(path, options, print);
    case "TSFunctionType":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType":
    case "TSConstructSignatureDeclaration":
      return printFunctionType(path, options, print);
    case "TSTupleType":
      return printArray(path, options, print);
    case "TSTypeReference":
      return [
        print("typeName"),
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSTypeAnnotation":
      return printTypeAnnotation(path, options, print);
    case "TSEmptyBodyFunctionExpression":
      return printMethodValue(path, options, print);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return printJSDocType(path, print, /* token */ "?");
    case "TSJSDocNonNullableType":
      return printJSDocType(path, print, /* token */ "!");
    case "TSParenthesizedType": // Removed in `../parse/postprocess.js`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "TypeScript");
  }
}

export { printTypescript };
