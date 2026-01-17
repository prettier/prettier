import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import isTsKeywordType from "../utilities/is-ts-keyword-type.js";
import { printArray } from "./array.js";
import { printArrayType } from "./array-type.js";
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
import { printFunctionType } from "./function-type.js";
import { printIndexSignature } from "./index-signature.js";
import { printIndexedAccessType } from "./indexed-access-type.js";
import { printInferType } from "./infer-type.js";
import { printIntersectionType } from "./intersection-type.js";
import { printJSDocType } from "./js-doc-type.js";
import { printTypeScriptMappedType } from "./mapped-type.js";
import { printMethodSignature } from "./method-signature.js";
import {
  printOptionalToken,
  printTypeScriptAccessibilityToken,
} from "./miscellaneous.js";
import { printImportKind } from "./module.js";
import { printModuleDeclaration } from "./module-declaration.js";
import { printPropertyKey } from "./property.js";
import { printRestType } from "./rest-type.js";
import { printTemplateLiteral } from "./template-literal.js";
import { printTernary } from "./ternary.js";
import { printNamedTupleMember } from "./tuple.js";
import { printTypeAlias } from "./type-alias.js";
import {
  printTypeAnnotation,
  printTypeAnnotationProperty,
} from "./type-annotation.js";
import { printTypeAssertion } from "./type-assertion.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printTypePredicate } from "./type-predicate.js";
import { printTypeQuery } from "./type-query.js";
import { printUnionType } from "./union-type.js";

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
    case "TSTypeAssertion":
      return printTypeAssertion(path, options, print);

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
    case "TSIndexSignature":
      return printIndexSignature(path, options, print);

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

    case "TSMethodSignature":
      return printMethodSignature(path, options, print);

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
      return printModuleDeclaration(path, options, print);

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
