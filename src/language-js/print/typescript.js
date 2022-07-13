import { printDanglingComments } from "../../main/comments.js";
import { hasNewlineInRange } from "../../common/util.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  indent,
  conditionalGroup,
  ifBreak,
} from "../../document/builders.js";
import {
  isLiteral,
  getTypeScriptMappedTypeModifier,
  shouldPrintComma,
  isCallExpression,
  isMemberExpression,
} from "../utils/index.js";
import isTsKeywordType from "../utils/is-ts-keyword-type.js";
import { locStart, locEnd } from "../loc.js";

import { printOptionalToken, printTypeScriptModifiers } from "./misc.js";
import { printTernary } from "./ternary.js";
import {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} from "./function-parameters.js";
import { printTemplateLiteral } from "./template-literal.js";
import { printArrayItems } from "./array.js";
import { printObject } from "./object.js";
import { printClassProperty, printClassMethod } from "./class.js";
import { printTypeParameter, printTypeParameters } from "./type-parameters.js";
import { printPropertyKey } from "./property.js";
import { printFunction, printMethodInternal } from "./function.js";
import { printInterface } from "./interface.js";
import { printBlock } from "./block.js";
import {
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
  printIndexedAccessType,
  printJSDocType,
} from "./type-annotation.js";

async function printTypescript(path, options, print) {
  const node = path.getValue();

  // TypeScript nodes always starts with `TS`
  if (!node.type.startsWith("TS")) {
    return;
  }

  if (isTsKeywordType(node)) {
    return node.type.slice(2, -7).toLowerCase();
  }

  const semi = options.semi ? ";" : "";
  const parts = [];

  switch (node.type) {
    case "TSThisType":
      return "this";
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        node.expression.type === "ArrayExpression" ||
        node.expression.type === "ObjectExpression"
      );

      const castGroup = group([
        "<",
        indent([softline, await print("typeAnnotation")]),
        softline,
        ">",
      ]);

      const exprContents = [
        ifBreak("("),
        indent([softline, await print("expression")]),
        softline,
        ifBreak(")"),
      ];

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          [castGroup, await print("expression")],
          [castGroup, group(exprContents, { shouldBreak: true })],
          [castGroup, await print("expression")],
        ]);
      }
      return group([castGroup, await print("expression")]);
    }
    case "TSDeclareFunction":
      return printFunction(path, print, options);
    case "TSExportAssignment":
      return ["export = ", await print("expression"), semi];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration":
      return printTypeAlias(path, options, print);
    case "TSQualifiedName":
      return join(".", [await print("left"), await print("right")]);
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "TSAbstractPropertyDefinition":
      return printClassProperty(path, options, print);
    case "TSInterfaceHeritage":
    case "TSExpressionWithTypeArguments": // Babel AST
      parts.push(await print("expression"));

      if (node.typeParameters) {
        parts.push(await print("typeParameters"));
      }

      return parts;
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return [
        await print("label"),
        node.optional ? "?" : "",
        ": ",
        await print("elementType"),
      ];
    case "TSRestType":
      return ["...", await print("typeAnnotation")];
    case "TSOptionalType":
      return [await print("typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSClassImplements":
      return [await print("expression"), await print("typeParameters")];
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");
    case "TSTypeParameter":
      return printTypeParameter(path, options, print);
    case "TSAsExpression": {
      parts.push(await print("expression"), " as ", await print("typeAnnotation"));
      const parent = path.getParentNode();
      if (
        (isCallExpression(parent) && parent.callee === node) ||
        (isMemberExpression(parent) && parent.object === node)
      ) {
        return group([indent([softline, ...parts]), softline]);
      }
      return parts;
    }
    case "TSArrayType":
      return [await print("elementType"), "[]"];
    case "TSPropertySignature": {
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        await printPropertyKey(path, options, print),
        await printOptionalToken(path)
      );

      if (node.typeAnnotation) {
        parts.push(": ", await print("typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (node.initializer) {
        parts.push(" = ", await print("initializer"));
      }

      return parts;
    }
    case "TSParameterProperty":
      if (node.accessibility) {
        parts.push(node.accessibility + " ");
      }
      if (node.export) {
        parts.push("export ");
      }
      if (node.static) {
        parts.push("static ");
      }
      if (node.override) {
        parts.push("override ");
      }
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(await print("parameter"));

      return parts;
    case "TSTypeQuery":
      return ["typeof ", await print("exprName"), await print("typeParameters")];
    case "TSIndexSignature": {
      const parent = path.getParentNode();

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
          join([", ", softline], await path.map(print, "parameters")),
        ]),
        trailingComma,
        softline,
      ]);

      return [
        node.export ? "export " : "",
        node.accessibility ? [node.accessibility, " "] : "",
        node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        node.declare ? "declare " : "",
        "[",
        node.parameters ? parametersGroup : "",
        node.typeAnnotation ? "]: " : "]",
        node.typeAnnotation ? await print("typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ];
    }
    case "TSTypePredicate":
      return [
        node.asserts ? "asserts " : "",
        await print("parameterName"),
        node.typeAnnotation ? [" is ", await print("typeAnnotation")] : "",
      ];
    case "TSNonNullExpression":
      return [await print("expression"), "!"];
    case "TSImportType":
      return [
        !node.isTypeOf ? "" : "typeof ",
        "import(",
        await print(node.parameter ? "parameter" : "argument"),
        ")",
        !node.qualifier ? "" : [".", print("qualifier")],
        await printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSLiteralType":
      return print("literal");
    case "TSIndexedAccessType":
      return printIndexedAccessType(path, options, print);
    case "TSConstructSignatureDeclaration":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType": {
      if (node.type === "TSConstructorType" && node.abstract) {
        parts.push("abstract ");
      }
      if (node.type !== "TSCallSignatureDeclaration") {
        parts.push("new ");
      }

      parts.push(
        group(
          await printFunctionParameters(
            path,
            print,
            options,
            /* expandArg */ false,
            /* printTypeParams */ true
          )
        )
      );

      if (node.returnType || node.typeAnnotation) {
        const isType = node.type === "TSConstructorType";
        parts.push(
          isType ? " => " : ": ",
          await print("returnType"),
          await print("typeAnnotation")
        );
      }
      return parts;
    }
    case "TSTypeOperator":
      return [node.operator, " ", await print("typeAnnotation")];
    case "TSMappedType": {
      const shouldBreak = hasNewlineInRange(
        options.originalText,
        locStart(node),
        locEnd(node)
      );
      return group(
        [
          "{",
          indent([
            options.bracketSpacing ? line : softline,
            node.readonly
              ? [
                  getTypeScriptMappedTypeModifier(node.readonly, "readonly"),
                  " ",
                ]
              : "",
            await printTypeScriptModifiers(path, options, print),
            await print("typeParameter"),
            node.optional
              ? getTypeScriptMappedTypeModifier(node.optional, "?")
              : "",
            node.typeAnnotation ? ": " : "",
            await print("typeAnnotation"),
            ifBreak(semi),
          ]),
          printDanglingComments(path, options, /* sameIndent */ true),
          options.bracketSpacing ? line : softline,
          "}",
        ],
        { shouldBreak }
      );
    }
    case "TSMethodSignature": {
      const kind = node.kind && node.kind !== "method" ? `${node.kind} ` : "";
      parts.push(
        node.accessibility ? [node.accessibility, " "] : "",
        kind,
        node.export ? "export " : "",
        node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        // "abstract" and "declare" are supported by only "babel-ts"
        // https://github.com/prettier/prettier/issues/9760
        node.abstract ? "abstract " : "",
        node.declare ? "declare " : "",
        node.computed ? "[" : "",
        await print("key"),
        node.computed ? "]" : "",
        printOptionalToken(path)
      );

      const parametersDoc = await printFunctionParameters(
        path,
        print,
        options,
        /* expandArg */ false,
        /* printTypeParams */ true
      );

      const returnTypePropertyName = node.returnType
        ? "returnType"
        : "typeAnnotation";
      const returnTypeNode = node[returnTypePropertyName];
      const returnTypeDoc = returnTypeNode ? await print(returnTypePropertyName) : "";
      const shouldGroupParameters = shouldGroupFunctionParameters(
        node,
        returnTypeDoc
      );

      parts.push(shouldGroupParameters ? group(parametersDoc) : parametersDoc);

      if (returnTypeNode) {
        parts.push(": ", group(returnTypeDoc));
      }

      return group(parts);
    }
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", await print("id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSEnumDeclaration":
      if (node.declare) {
        parts.push("declare ");
      }

      if (node.modifiers) {
        parts.push(await printTypeScriptModifiers(path, options, print));
      }
      if (node.const) {
        parts.push("const ");
      }

      parts.push("enum ", await print("id"), " ");

      if (node.members.length === 0) {
        parts.push(
          group(["{", printDanglingComments(path, options), softline, "}"])
        );
      } else {
        parts.push(
          group([
            "{",
            indent([
              hardline,
              await printArrayItems(path, options, "members", print),
              shouldPrintComma(options, "es5") ? "," : "",
            ]),
            printDanglingComments(path, options, /* sameIndent */ true),
            hardline,
            "}",
          ])
        );
      }

      return parts;
    case "TSEnumMember":
      if (node.computed) {
        parts.push("[", await print("id"), "]");
      } else {
        parts.push(await print("id"));
      }

      if (node.initializer) {
        parts.push(" = ", await print("initializer"));
      }
      return parts;
    case "TSImportEqualsDeclaration":
      if (node.isExport) {
        parts.push("export ");
      }

      parts.push("import ");

      if (node.importKind && node.importKind !== "value") {
        parts.push(node.importKind, " ");
      }

      parts.push(await print("id"), " = ", await print("moduleReference"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSExternalModuleReference":
      return ["require(", await print("expression"), ")"];
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(node.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration =
        node.body && node.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (node.declare) {
          parts.push("declare ");
        }
        parts.push(await printTypeScriptModifiers(path, options, print));

        const textBetweenNodeAndItsId = options.originalText.slice(
          locStart(node),
          locStart(node.id)
        );

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          node.id.type === "Identifier" &&
          node.id.name === "global" &&
          !/namespace|module/.test(textBetweenNodeAndItsId);

        if (!isGlobalDeclaration) {
          parts.push(
            isExternalModule ||
              /(?:^|\s)module(?:\s|$)/.test(textBetweenNodeAndItsId)
              ? "module "
              : "namespace "
          );
        }
      }

      parts.push(await print("id"));

      if (bodyIsDeclaration) {
        parts.push(await print("body"));
      } else if (node.body) {
        parts.push(" ", group(await print("body")));
      } else {
        parts.push(semi);
      }

      return parts;
    }

    case "TSConditionalType":
      return printTernary(path, options, print);

    case "TSInferType":
      return ["infer", " ", await print("typeParameter")];
    case "TSIntersectionType":
      return printIntersectionType(path, options, print);
    case "TSUnionType":
      return printUnionType(path, options, print);
    case "TSFunctionType":
      return printFunctionType(path, options, print);
    case "TSTupleType":
      return printTupleType(path, options, print);
    case "TSTypeReference":
      return [
        await print("typeName"),
        await printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSTypeAnnotation":
      return print("typeAnnotation");
    case "TSEmptyBodyFunctionExpression":
      return printMethodInternal(path, options, print);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return printJSDocType(path, print, /* token */ "?");
    case "TSJSDocNonNullableType":
      return printJSDocType(path, print, /* token */ "!");
    case "TSInstantiationExpression":
      return [await print("expression"), await print("typeParameters")];
    default:
      /* istanbul ignore next */
      throw new Error(
        `Unknown TypeScript node type: ${JSON.stringify(node.type)}.`
      );
  }
}

export { printTypescript };
