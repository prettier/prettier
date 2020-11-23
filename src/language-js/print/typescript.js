"use strict";

const { printDanglingComments } = require("../../main/comments");
const { hasNewlineInRange } = require("../../common/util");
const {
  builders: {
    concat,
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
} = require("../utils");
const { locStart, locEnd } = require("../loc");

const { printOptionalToken, printTypeScriptModifiers } = require("./misc");
const printTernaryOperator = require("./ternary");
const { printFunctionParameters } = require("./function-parameters");
const { printTemplateLiteral } = require("./template-literal");
const { printArrayItems } = require("./array");
const { printObject } = require("./object");
const { printClassProperty, printClassMethod } = require("./class");
const {
  printTypeParameter,
  printTypeParameters,
} = require("./type-parameters");
const { printPropertyKey } = require("./property");
const { printFunctionDeclaration } = require("./function");
const { printInterface } = require("./interface");
const { printAssignmentRight } = require("./assignment");
const { printBlock } = require("./block");

function printTypescript(path, options, print) {
  const n = path.getValue();
  const semi = options.semi ? ";" : "";
  const parts = [];
  switch (n.type) {
    case "TSTypeAssertion": {
      const shouldBreakAfterCast = !(
        n.expression.type === "ArrayExpression" ||
        n.expression.type === "ObjectExpression"
      );

      const castGroup = group(
        concat([
          "<",
          indent(concat([softline, path.call(print, "typeAnnotation")])),
          softline,
          ">",
        ])
      );

      const exprContents = concat([
        ifBreak("("),
        indent(concat([softline, path.call(print, "expression")])),
        softline,
        ifBreak(")"),
      ]);

      if (shouldBreakAfterCast) {
        return conditionalGroup([
          concat([castGroup, path.call(print, "expression")]),
          concat([castGroup, group(exprContents, { shouldBreak: true })]),
          concat([castGroup, path.call(print, "expression")]),
        ]);
      }
      return group(concat([castGroup, path.call(print, "expression")]));
    }
    case "TSDeclareFunction":
      return printFunctionDeclaration(path, print, options);
    case "TSExportAssignment":
      return concat(["export = ", path.call(print, "expression"), semi]);
    case "TSModuleBlock":
      return printBlock(path, options, print);
    case "TSInterfaceBody":
    case "TSTypeLiteral":
      return printObject(path, options, print);
    case "TSTypeAliasDeclaration": {
      if (n.declare) {
        parts.push("declare ");
      }

      const printed = printAssignmentRight(
        n.id,
        n.typeAnnotation,
        n.typeAnnotation && path.call(print, "typeAnnotation"),
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

      if (n.typeParameters) {
        parts.push(path.call(print, "typeParameters"));
      }

      return concat(parts);
    case "TSTemplateLiteralType":
      return printTemplateLiteral(path, print, options);
    case "TSNamedTupleMember":
      return concat([
        path.call(print, "label"),
        n.optional ? "?" : "",
        ": ",
        path.call(print, "elementType"),
      ]);
    case "TSRestType":
      return concat(["...", path.call(print, "typeAnnotation")]);
    case "TSOptionalType":
      return concat([path.call(print, "typeAnnotation"), "?"]);
    case "TSInterfaceDeclaration":
      return printInterface(path, options, print);
    case "TSClassImplements":
      return concat([
        path.call(print, "expression"),
        path.call(print, "typeParameters"),
      ]);
    case "TSTypeParameterDeclaration":
    case "TSTypeParameterInstantiation":
      return printTypeParameters(path, options, print, "params");

    case "TSTypeParameter":
    case "TypeParameter":
      return printTypeParameter(path, options, print);
    case "TypeofTypeAnnotation":
      return concat(["typeof ", path.call(print, "argument")]);
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
    case "TSAsExpression":
      return concat([
        path.call(print, "expression"),
        " as ",
        path.call(print, "typeAnnotation"),
      ]);
    case "TSArrayType":
      return concat([path.call(print, "elementType"), "[]"]);
    case "TSPropertySignature": {
      if (n.export) {
        parts.push("export ");
      }
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(
        printPropertyKey(path, options, print),
        printOptionalToken(path)
      );

      if (n.typeAnnotation) {
        parts.push(": ");
        parts.push(path.call(print, "typeAnnotation"));
      }

      // This isn't valid semantically, but it's in the AST so we can print it.
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }

      return concat(parts);
    }
    case "TSParameterProperty":
      if (n.accessibility) {
        parts.push(n.accessibility + " ");
      }
      if (n.export) {
        parts.push("export ");
      }
      if (n.static) {
        parts.push("static ");
      }
      if (n.readonly) {
        parts.push("readonly ");
      }

      parts.push(path.call(print, "parameter"));

      return concat(parts);
    case "TSTypeQuery":
      return concat(["typeof ", path.call(print, "exprName")]);
    case "TSIndexSignature": {
      const parent = path.getParentNode();

      // The typescript parser accepts multiple parameters here. If you're
      // using them, it makes sense to have a trailing comma. But if you
      // aren't, this is more like a computed property name than an array.
      // So we leave off the trailing comma when there's just one parameter.
      const trailingComma =
        n.parameters.length > 1
          ? ifBreak(shouldPrintComma(options) ? "," : "")
          : "";

      const parametersGroup = group(
        concat([
          indent(
            concat([
              softline,
              join(concat([", ", softline]), path.map(print, "parameters")),
            ])
          ),
          trailingComma,
          softline,
        ])
      );

      return concat([
        n.export ? "export " : "",
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.declare ? "declare " : "",
        "[",
        n.parameters ? parametersGroup : "",
        n.typeAnnotation ? "]: " : "]",
        n.typeAnnotation ? path.call(print, "typeAnnotation") : "",
        parent.type === "ClassBody" ? semi : "",
      ]);
    }
    case "TSTypePredicate":
      return concat([
        n.asserts ? "asserts " : "",
        path.call(print, "parameterName"),
        n.typeAnnotation
          ? concat([" is ", path.call(print, "typeAnnotation")])
          : "",
      ]);
    case "TSNonNullExpression":
      return concat([path.call(print, "expression"), "!"]);
    case "TSImportType":
      return concat([
        !n.isTypeOf ? "" : "typeof ",
        "import(",
        path.call(print, n.parameter ? "parameter" : "argument"),
        ")",
        !n.qualifier ? "" : concat([".", path.call(print, "qualifier")]),
        printTypeParameters(path, options, print, "typeParameters"),
      ]);
    case "TSLiteralType":
      return path.call(print, "literal");
    case "TSIndexedAccessType":
      return concat([
        path.call(print, "objectType"),
        "[",
        path.call(print, "indexType"),
        "]",
      ]);
    case "TSConstructSignatureDeclaration":
    case "TSCallSignatureDeclaration":
    case "TSConstructorType": {
      if (n.type !== "TSCallSignatureDeclaration") {
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

      if (n.returnType || n.typeAnnotation) {
        const isType = n.type === "TSConstructorType";
        parts.push(
          isType ? " => " : ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return concat(parts);
    }
    case "TSTypeOperator":
      return concat([n.operator, " ", path.call(print, "typeAnnotation")]);
    case "TSMappedType": {
      const shouldBreak = hasNewlineInRange(
        options.originalText,
        locStart(n),
        locEnd(n)
      );
      return group(
        concat([
          "{",
          indent(
            concat([
              options.bracketSpacing ? line : softline,
              n.readonly
                ? concat([
                    getTypeScriptMappedTypeModifier(n.readonly, "readonly"),
                    " ",
                  ])
                : "",
              printTypeScriptModifiers(path, options, print),
              path.call(print, "typeParameter"),
              n.optional
                ? getTypeScriptMappedTypeModifier(n.optional, "?")
                : "",
              n.typeAnnotation ? ": " : "",
              path.call(print, "typeAnnotation"),
              ifBreak(semi, ""),
            ])
          ),
          printDanglingComments(path, options, /* sameIndent */ true),
          options.bracketSpacing ? line : softline,
          "}",
        ]),
        { shouldBreak }
      );
    }
    case "TSMethodSignature":
      parts.push(
        n.accessibility ? concat([n.accessibility, " "]) : "",
        n.export ? "export " : "",
        n.static ? "static " : "",
        n.readonly ? "readonly " : "",
        n.computed ? "[" : "",
        path.call(print, "key"),
        n.computed ? "]" : "",
        printOptionalToken(path),
        printFunctionParameters(
          path,
          print,
          options,
          /* expandArg */ false,
          /* printTypeParams */ true
        )
      );

      if (n.returnType || n.typeAnnotation) {
        parts.push(
          ": ",
          path.call(print, "returnType"),
          path.call(print, "typeAnnotation")
        );
      }
      return group(concat(parts));
    case "TSNamespaceExportDeclaration":
      parts.push("export as namespace ", path.call(print, "id"));

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSEnumDeclaration":
      if (n.declare) {
        parts.push("declare ");
      }

      if (n.modifiers) {
        parts.push(printTypeScriptModifiers(path, options, print));
      }
      if (n.const) {
        parts.push("const ");
      }

      parts.push("enum ", path.call(print, "id"), " ");

      if (n.members.length === 0) {
        parts.push(
          group(
            concat(["{", printDanglingComments(path, options), softline, "}"])
          )
        );
      } else {
        parts.push(
          group(
            concat([
              "{",
              indent(
                concat([
                  hardline,
                  printArrayItems(path, options, "members", print),
                  shouldPrintComma(options, "es5") ? "," : "",
                ])
              ),
              printDanglingComments(path, options, /* sameIndent */ true),
              hardline,
              "}",
            ])
          )
        );
      }

      return concat(parts);
    case "TSEnumMember":
      parts.push(path.call(print, "id"));
      if (n.initializer) {
        parts.push(" = ", path.call(print, "initializer"));
      }
      return concat(parts);
    case "TSImportEqualsDeclaration":
      if (n.isExport) {
        parts.push("export ");
      }
      parts.push(
        "import ",
        path.call(print, "id"),
        " = ",
        path.call(print, "moduleReference")
      );

      if (options.semi) {
        parts.push(";");
      }

      return group(concat(parts));
    case "TSExternalModuleReference":
      return concat(["require(", path.call(print, "expression"), ")"]);
    case "TSModuleDeclaration": {
      const parent = path.getParentNode();
      const isExternalModule = isLiteral(n.id);
      const parentIsDeclaration = parent.type === "TSModuleDeclaration";
      const bodyIsDeclaration = n.body && n.body.type === "TSModuleDeclaration";

      if (parentIsDeclaration) {
        parts.push(".");
      } else {
        if (n.declare) {
          parts.push("declare ");
        }
        parts.push(printTypeScriptModifiers(path, options, print));

        const textBetweenNodeAndItsId = options.originalText.slice(
          locStart(n),
          locStart(n.id)
        );

        // Global declaration looks like this:
        // (declare)? global { ... }
        const isGlobalDeclaration =
          n.id.type === "Identifier" &&
          n.id.name === "global" &&
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
      } else if (n.body) {
        parts.push(" ", group(path.call(print, "body")));
      } else {
        parts.push(semi);
      }

      return concat(parts);
    }
    // TODO: Temporary auto-generated node type. To remove when typescript-estree has proper support for private fields.
    case "TSPrivateIdentifier":
      return n.escapedText;

    case "TSConditionalType":
      return printTernaryOperator(path, options, print, {
        beforeParts: () => [
          path.call(print, "checkType"),
          " ",
          "extends",
          " ",
          path.call(print, "extendsType"),
        ],
        afterParts: () => [],
        shouldCheckJsx: false,
        conditionalNodeType: "TSConditionalType",
        consequentNodePropertyName: "trueType",
        alternateNodePropertyName: "falseType",
        testNodePropertyNames: ["checkType", "extendsType"],
      });

    case "TSInferType":
      return concat(["infer", " ", path.call(print, "typeParameter")]);

    // These are not valid TypeScript. Printing them just for the sake of error recovery.
    case "TSJSDocAllType":
      return "*";
    case "TSJSDocUnknownType":
      return "?";
    case "TSJSDocNullableType":
      return concat(["?", path.call(print, "typeAnnotation")]);
    case "TSJSDocNonNullableType":
      return concat(["!", path.call(print, "typeAnnotation")]);
    case "TSJSDocFunctionType":
      return concat([
        "function(",
        // The parameters could be here, but typescript-estree doesn't convert them anyway (throws an error).
        "): ",
        path.call(print, "typeAnnotation"),
      ]);
  }
}

module.exports = { printTypescript };
