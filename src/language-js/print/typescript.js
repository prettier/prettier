import {
  conditionalGroup,
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/builders.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import {
  isArrayExpression,
  isObjectExpression,
  shouldPrintComma,
} from "../utils/index.js";
import isTsKeywordType from "../utils/is-ts-keyword-type.js";
import { printArray } from "./array.js";
import { printBlock } from "./block.js";
import { printCallExpression } from "./call-expression.js";
import { printBinaryCastExpression } from "./cast-expression.js";
import {
  printClass,
  printClassBody,
  printClassMemberSemicolon,
  printClassMethod,
  printClassProperty,
} from "./class.js";
import {
  printEnumBody,
  printEnumDeclaration,
  printEnumMember,
} from "./enum.js";
import { printFunction, printMethodValue } from "./function.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printTypeScriptMappedType } from "./mapped-type.js";
import {
  printDeclareToken,
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./misc.js";
import { printImportKind } from "./module.js";
import { printPropertyKey } from "./property.js";
import { printTemplateLiteral } from "./template-literal.js";
import { printTernary } from "./ternary.js";
import {
  printArrayType,
  printFunctionType,
  printIndexedAccessType,
  printInferType,
  printIntersectionType,
  printJSDocType,
  printNamedTupleMember,
  printRestType,
  printTypeAlias,
  printTypeAnnotation,
  printTypeAnnotationProperty,
  printTypePredicate,
  printTypeQuery,
  printUnionType,
} from "./type-annotation.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";

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

  switch (node.type) {
    case "TSThisType":
      return "this";
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        isArrayExpression(node.expression) ||
        isObjectExpression(node.expression)
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
      return printFunction(path, options, print);
    case "TSExportAssignment":
      return ["export = ", print("expression"), options.semi ? ";" : ""];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printClassBody(path, options, print);
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
    case "TSInstantiationExpression":
      return [print("expression"), print("typeArguments")];
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, options, print);
    case "TSNamedTupleMember":
      return printNamedTupleMember(path, options, print);
    case "TSRestType":
      return printRestType(path, options, print);
    case "TSOptionalType":
      return [print("typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printClass(path, options, print);
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");
    case "TSTypeParameter":
      return printTypeParameter(path, options, print);
    case "TSAsExpression":
    case "TSSatisfiesExpression":
      return printBinaryCastExpression(path, options, print);

    case "TSArrayType":
      return printArrayType(print);
    case "TSPropertySignature":
      return [
        node.readonly ? "readonly " : "",
        printPropertyKey(path, options, print),
        printOptionalToken(path),
        printTypeAnnotationProperty(path, print),
        printClassMemberSemicolon(path, options),
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
        path.key === "body" && path.parent.type === "ClassBody";

      return [
        // `static` only allowed in class member
        isClassMember && node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        "[",
        node.parameters ? parametersGroup : "",
        "]",
        printTypeAnnotationProperty(path, print),
        printClassMemberSemicolon(path, options),
      ];
    }
    case "TSTypePredicate":
      return printTypePredicate(path, print);
    case "TSNonNullExpression":
      return [print("expression"), "!"];
    case "TSImportType":
      return [
        printCallExpression(path, options, print),
        !node.qualifier ? "" : [".", print("qualifier")],
        printTypeParameters(path, options, print, "typeArguments"),
      ];
    case "TSLiteralType":
      return print("literal");
    case "TSIndexedAccessType":
      return printIndexedAccessType(path, options, print);

    case "TSTypeOperator":
      return [node.operator, " ", print("typeAnnotation")];

    case "TSMappedType":
      return printTypeScriptMappedType(path, options, print);

    case "TSMethodSignature": {
      const parts = [];
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
        options,
        print,
        /* shouldExpandArgument */ false,
        /* shouldPrintTypeParameters */ true,
      );

      const returnTypeDoc = printTypeAnnotationProperty(
        path,
        print,
        "returnType",
      );
      const shouldGroupParameters = shouldGroupFunctionParameters(
        node,
        returnTypeDoc,
      );

      parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

      if (node.returnType) {
        parts.push(group(returnTypeDoc));
      }

      return [group(parts), printClassMemberSemicolon(path, options)];
    }
    case "TSNamespaceExportDeclaration":
      return ["export as namespace ", print("id"), options.semi ? ";" : ""];
    case "TSEnumDeclaration":
      return printEnumDeclaration(path, print);
    case "TSEnumBody":
      return printEnumBody(path, options, print);
    case "TSEnumMember":
      return printEnumMember(path, print);

    case "TSImportEqualsDeclaration":
      return [
        "import ",
        printImportKind(node, /* spaceBeforeKind */ false),
        print("id"),
        " = ",
        print("moduleReference"),
        options.semi ? ";" : "",
      ];
    case "TSExternalModuleReference":
      return printCallExpression(path, options, print);
    case "TSModuleDeclaration":
      return [
        printDeclareToken(path),
        node.kind === "global" ? "" : `${node.kind} `,
        print("id"),
        node.body ? [" ", group(print("body"))] : options.semi ? ";" : "",
      ];

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
        printTypeParameters(path, options, print, "typeArguments"),
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
