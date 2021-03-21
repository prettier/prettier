"use strict";

const { printDanglingComments } = require("../../main/comments");
const { hasNewlineInRange } = require("../../common/util");
const {
  builders: {
    join,
    line,
    hardline,
    softline,
    group,
    indent,
    conditionalGroup,
    ifBreak,
  },
} = require("../../document");
const {
  isLiteral,
  getTypeScriptMappedTypeModifier,
  shouldPrintComma,
  isCallExpression,
  isMemberExpression,
} = require("../utils");
const { locStart, locEnd } = require("../loc");

const { printOptionalToken, printTypeScriptModifiers } = require("./misc");
const { printTernary } = require("./ternary");
const {
  printFunctionParameters,
  shouldGroupFunctionParameters,
} = require("./function-parameters");
const { printTemplateLiteral } = require("./template-literal");
const { printArrayItems } = require("./array");
const { printObject } = require("./object");
const { printClassProperty, printClassMethod } = require("./class");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./type-parameters");
const { printPropertyKey } = require("./property");
const { printFunctionDeclaration, printMethodInternal } = require("./function");
const { printInterface } = require("./interface");
const { printBlock } = require("./block");
const {
  printTypeAlias,
  printIntersectionType,
  printUnionType,
  printFunctionType,
  printTupleType,
} = require("./type-annotation");

function printTypescript(path, options, print) {
  const node = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = [];
  switch (node.type) {
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        node.expression.type === "ArrayExpression" ||
        node.expression.type === "ObjectExpression"
      );

      const castGroup = group([
        "<",
        indent([softline, path.call(print, "typeAnnotation")]),
        softline,
        ">",
      ]);

      const exprContents = [
        ifBreak("("),
        indent([softline, path.call(print, "expression")]),
        softline,
        ifBreak(")"),
      ];

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          [castGroup, path.call(print, "expression")],
          [castGroup, group(exprContents, { shouldBreak: true })],
          [castGroup, path.call(print, "expression")],
        ]);
      }
      return group([castGroup, path.call(print, "expression")]);
    }
    case "TSDeclareFunction":
      return printFunctionDeclaration(path, print, options);
    case "TSExportAssignment":
      return ["export = ", path.call(print, "expression"), semi];
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration":
      return printTypeAlias(path, options, print);
    case "TSQualifiedName":
      return join(".", [path.call(print, "left"), path.call(print, "right")]);
    case "TSAbstractMethodDefinition":
    case "TSDeclareMethod":
      return printClassMethod(path, options, print);
    case "TSAbstractClassProperty":
      return printClassProperty(path, options, print);
    case "TSInterfaceHeritage":
    case "TSExpressionWithTypeArguments": // Babel AST
      parts.push(path.call(print, "expression"));

      if (node.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return parts;
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return [
        path.call(print, "label"),
        node.optional ? "?" : "",
        ": ",
        path.call(print, "elementType"),
      ];
    case "TSRestType":
      return ["...", path.call(print, "typeAnnotation")];
    case "TSOptionalType":
      return [path.call(print, "typeAnnotation"), "?"];
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSClassImplements":
      return [
        path.call(print, "expression"),
        path.call(print, "typeParameters"),
      ];
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return ["typeof ", path.call(print, "argument")];
    case "TSAbstractKeyword":
      return "abstract";
    case "TSAsyncKeyword":
      return "async";
    case "TSDeclareKeyword":
      return "declare";
    case "TSExportKeyword":
      return "export";
    case "TSNeverKeyword":
      return "never";
    case "TSObjectKeyword":
      return "object";
    case "TSProtectedKeyword":
      return "protected";
    case "TSPrivateKeyword":
      return "private";
    case "TSPublicKeyword":
      return "public";
    case "TSReadonlyKeyword":
      return "readonly";
    case "TSStaticKeyword":
      return "static";
    case "TSUndefinedKeyword":
      return "undefined";
    case "TSUnknownKeyword":
      return "unknown";
    case "TSIntrinsicKeyword":
      return "intrinsic";
    case "TSAsExpression": {
      parts.push(
        path.call(print, "expression"),
        " as ",
        path.call(print, "typeAnnotation")
      );
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
      return [path.call(print, "elementType"), "[]"];
    case "TSPropertySignature": {
      if (node.export) {
        parts.push("export ");
      }
      if (node.accessibility) {
        parts.push(node.accessibility + " ");
      }
      if (node.static) {
        parts.push("static ");
      }
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path)
      );

      if (node.typeAnnotation) {
        parts.push(": ", path.call(print, "typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (node.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
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
      if (node.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));

      return parts;
    case "TSTypeQuery":
      return ["typeof ", path.call(print, "exprName")];
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
          join([", ", softline], path.map(print, "parameters")),
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
        node.typeAnnotation ? path.call(print, "typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ];
    }
    case "TSTypePredicate":
      return [
        node.asserts ? "asserts " : "",
        path.call(print, "parameterName"),
        node.typeAnnotation ? [" is ", path.call(print, "typeAnnotation")] : "",
      ];
    case "TSNonNullExpression":
      return [path.call(print, "expression"), "!"];
    case "TSImportType":
      return [
        !node.isTypeOf ? "" : "typeof ",
        "import(",
        path.call(print, node.parameter ? "parameter" : "argument"),
        ")",
        !node.qualifier ? "" : [".", path.call(print, "qualifier")],
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSLiteralType":
      return path.call(print, "literal");
    case "TSIndexedAccessType":
      return [
        path.call(print, "objectType"),
        "[",
        path.call(print, "indexType"),
        "]",
      ];
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
          printFunctionParameters(
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
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return parts;
    }
    case "TSTypeOperator":
      return [node.operator, " ", path.call(print, "typeAnnotation")];
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
            printTypeScriptModifiers(path, options, print),
            path.call(print, "typeParameter"),
            node.optional
              ? getTypeScriptMappedTypeModifier(node.optional, "?")
              : "",
            node.typeAnnotation ? ": " : "",
            path.call(print, "typeAnnotation"),
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
      parts.push(
        node.accessibility ? [node.accessibility, " "] : "",
        node.export ? "export " : "",
        node.static ? "static " : "",
        node.readonly ? "readonly " : "",
        // "abstract" and "declare" are supported by only "babel-ts"
        // https://github.com/prettier/prettier/issues/9760
        node.abstract ? "abstract " : "",
        node.declare ? "declare " : "",
        node.computed ? "[" : "",
        path.call(print, "key"),
        node.computed ? "]" : "",
        printOptionalToken(path)
      );

      const parametersDoc = printFunctionParameters(
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
      const returnTypeDoc = returnTypeNode
        ? path.call(print, returnTypePropertyName)
        : "";
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
      parts.push("export as namespace ", path.call(print, "id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSEnumDeclaration":
      if (node.declare) {
        parts.push("declare ");
      }

      if (node.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (node.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

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
              printArrayItems(path, options, "members", print),
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
      parts.push(path.call(print, "id"));
      if (node.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
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

      parts.push(
        path.call(print, "id"),
        " = ",
        path.call(print, "moduleReference")
      );

      if (options.semi) {
        parts.push(";");
      }

      return group(parts);
    case "TSExternalModuleReference":
      return ["require(", path.call(print, "expression"), ")"];
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
        parts.push(printTypeScriptModifiers(path, options, print));

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
              /(^|\s)module(\s|$)/.test(textBetweenNodeAndItsId)
              ? "module "
              : "namespace "
          );
        }
      }

      parts.push(path.call(print, "id"));

      if (bodyIsDeclaration) {
        parts.push(path.call(print, "body"));
      } else if (node.body) {
        parts.push(" ", group(path.call(print, "body")));
      } else {
        parts.push(semi);
      }

      return parts;
    }
    // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
    case "TSPrivateIdentifier":
      return node.escapedText;

    case "TSConditionalType":
      return printTernary(path, options, print);

    case "TSInferType":
      return ["infer", " ", path.call(print, "typeParameter")];
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
        path.call(print, "typeName"),
        printTypeParameters(path, options, print, "typeParameters"),
      ];
    case "TSTypeAnnotation":
      return path.call(print, "typeAnnotation");
    case "TSEmptyBodyFunctionExpression":
      return printMethodInternal(path, options, print);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return ["?", path.call(print, "typeAnnotation")];
    case "TSJSDocNonNullableType":
      return ["!", path.call(print, "typeAnnotation")];
    case "TSJSDocFunctionType":
      return [
        "function(",
        // The parameters could be here, but typescript-estree doesn't convert them anyway (throws an error).
        "): ",
        path.call(print, "typeAnnotation"),
      ];
  }
}

module.exports = { printTypescript };
