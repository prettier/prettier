// TODO(azz): anything that imports from main shouldn't be in a `language-*` dir.
import { printDanglingComments } from "../main/comments/print.js";
import printIgnored from "../main/print-ignored.js";
import hasNewline from "../utils/has-newline.js";
import {
  join,
  line,
  hardline,
  softline,
  group,
  indent,
} from "../document/builders.js";
import { replaceEndOfLine, inheritLabel } from "../document/utils.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";

import pathNeedsParens from "./needs-parens.js";
import {
  hasComment,
  CommentCheckFlags,
  isNextLineEmpty,
  needsHardlineAfterDanglingComment,
  isCallExpression,
  isMemberExpression,
  isArrayOrTupleExpression,
  isObjectOrRecordExpression,
  startsWithNoLookaheadToken,
  createTypeCheckFunction,
} from "./utils/index.js";
import { locStart, locEnd } from "./loc.js";
import isBlockComment from "./utils/is-block-comment.js";
import isIgnored from "./utils/is-ignored.js";

import { printHtmlBinding } from "./print/html-binding.js";
import { printAngular } from "./print/angular.js";
import { printJsx } from "./print/jsx.js";
import { printFlow } from "./print/flow.js";
import { printTypescript } from "./print/typescript.js";
import {
  printOptionalToken,
  printBindExpressionCallee,
  adjustClause,
  printRestSpread,
  printDefiniteToken,
  printDeclareToken,
} from "./print/misc.js";
import {
  printImportDeclaration,
  printExportDeclaration,
  printModuleSpecifier,
} from "./print/module.js";
import { printTernary } from "./print/ternary.js";
import {
  printTaggedTemplateLiteral,
  printTemplateLiteral,
} from "./print/template-literal.js";
import { printArray } from "./print/array.js";
import { printObject } from "./print/object.js";
import {
  printClass,
  printClassMethod,
  printClassProperty,
  printClassBody,
} from "./print/class.js";
import { printProperty } from "./print/property.js";
import {
  printFunction,
  printArrowFunction,
  printMethod,
  printReturnStatement,
  printThrowStatement,
} from "./print/function.js";
import { printCallExpression } from "./print/call-expression.js";
import {
  printVariableDeclarator,
  printAssignmentExpression,
} from "./print/assignment.js";
import { printBinaryishExpression } from "./print/binaryish.js";
import { printStatementSequence } from "./print/statement.js";
import { printMemberExpression } from "./print/member.js";
import { printBlock, printBlockBody } from "./print/block.js";
import { printLiteral } from "./print/literal.js";
import { printDecorators } from "./print/decorators.js";
import { printTypeAnnotationProperty } from "./print/type-annotation.js";
import { shouldPrintLeadingSemicolon } from "./print/semicolon.js";
import { printExpressionStatement } from "./print/expression-statement.js";

/**
 * @typedef {import("../common/ast-path.js").default} AstPath
 * @typedef {import("../document/builders.js").Doc} Doc
 */

// Their decorators are handled themselves, and they don't need parentheses or leading semicolons
const shouldPrintDirectly = createTypeCheckFunction([
  "ClassMethod",
  "ClassPrivateMethod",
  "ClassProperty",
  "ClassAccessorProperty",
  "AccessorProperty",
  "TSAbstractAccessorProperty",
  "PropertyDefinition",
  "TSAbstractPropertyDefinition",
  "ClassPrivateProperty",
  "MethodDefinition",
  "TSAbstractMethodDefinition",
  "TSDeclareMethod",
]);

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @param {*} [args]
 * @returns {Doc}
 */
function genericPrint(path, options, print, args) {
  const doc = printPathNoParens(path, options, print, args);
  if (!doc) {
    return "";
  }

  const { node } = path;
  if (shouldPrintDirectly(node)) {
    return doc;
  }

  const hasDecorators = isNonEmptyArray(node.decorators);
  const decoratorsDoc = printDecorators(path, options, print);
  const isClassExpression = node.type === "ClassExpression";
  // Nodes (except `ClassExpression`) with decorators can't have parentheses and don't need leading semicolons
  if (hasDecorators && !isClassExpression) {
    return inheritLabel(doc, (doc) => group([decoratorsDoc, doc]));
  }

  const needsParens = pathNeedsParens(path, options);
  const needsSemi = shouldPrintLeadingSemicolon(path, options);

  if (!decoratorsDoc && !needsParens && !needsSemi) {
    return doc;
  }

  return inheritLabel(doc, (doc) => [
    needsSemi ? ";" : "",
    needsParens ? "(" : "",
    needsParens && isClassExpression && hasDecorators
      ? [indent([line, decoratorsDoc, doc]), line]
      : [decoratorsDoc, doc],
    needsParens ? ")" : "",
  ]);
}

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @param {*} [args]
 * @returns {Doc}
 */
function printPathNoParens(path, options, print, args) {
  if (isIgnored(path)) {
    return printIgnored(path, options);
  }

  for (const printer of [
    printLiteral,
    printHtmlBinding,
    printAngular,
    printJsx,
    printFlow,
    printTypescript,
  ]) {
    const printed = printer(path, options, print);
    if (printed !== undefined) {
      return printed;
    }
  }

  const { node } = path;
  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  let parts = [];

  switch (node.type) {
    case "JsExpressionRoot":
      return print("node");
    case "JsonRoot":
      return [print("node"), hardline];
    case "File":
      return print("program");

    case "Program":
      return printBlockBody(path, options, print);
    // Babel extension.
    case "EmptyStatement":
      return "";
    case "ExpressionStatement":
      return printExpressionStatement(path, options, print);

    case "ChainExpression":
      return print("expression");

    // Babel non-standard node. Used for Closure-style type casts. See postprocess.js.
    case "ParenthesizedExpression": {
      const shouldHug =
        !hasComment(node.expression) &&
        (isObjectOrRecordExpression(node.expression) ||
          isArrayOrTupleExpression(node.expression));
      if (shouldHug) {
        return ["(", print("expression"), ")"];
      }
      return group([
        "(",
        indent([softline, print("expression")]),
        softline,
        ")",
      ]);
    }
    case "AssignmentExpression":
      return printAssignmentExpression(path, options, print);
    case "VariableDeclarator":
      return printVariableDeclarator(path, options, print);
    case "BinaryExpression":
    case "LogicalExpression":
      return printBinaryishExpression(path, options, print);
    case "AssignmentPattern":
      return [print("left"), " = ", print("right")];
    case "OptionalMemberExpression":
    case "MemberExpression":
      return printMemberExpression(path, options, print);

    case "MetaProperty":
      return [print("meta"), ".", print("property")];
    case "BindExpression":
      if (node.object) {
        parts.push(print("object"));
      }

      parts.push(
        group(
          indent([softline, printBindExpressionCallee(path, options, print)])
        )
      );

      return parts;
    case "Identifier":
      return [
        node.name,
        printOptionalToken(path),
        printDefiniteToken(path),
        printTypeAnnotationProperty(path, print),
      ];

    case "V8IntrinsicIdentifier":
      return ["%", node.name];
    case "SpreadElement":
    case "SpreadElementPattern":
    case "SpreadPropertyPattern":
    case "RestElement":
      return printRestSpread(path, print);
    case "FunctionDeclaration":
    case "FunctionExpression":
      return printFunction(path, print, options, args);
    case "ArrowFunctionExpression":
      return printArrowFunction(path, options, print, args);
    case "YieldExpression":
      parts.push("yield");

      if (node.delegate) {
        parts.push("*");
      }
      if (node.argument) {
        parts.push(" ", print("argument"));
      }

      return parts;
    case "AwaitExpression":
      parts.push("await");
      if (node.argument) {
        parts.push(" ", print("argument"));
        const { parent } = path;
        if (
          (isCallExpression(parent) && parent.callee === node) ||
          (isMemberExpression(parent) && parent.object === node)
        ) {
          parts = [indent([softline, ...parts]), softline];
          // avoid printing `await (await` on one line
          const parentAwaitOrBlock = path.findAncestor(
            (node) =>
              node.type === "AwaitExpression" || node.type === "BlockStatement"
          );
          if (
            parentAwaitOrBlock?.type !== "AwaitExpression" ||
            !startsWithNoLookaheadToken(
              parentAwaitOrBlock.argument,
              (leftmostNode) => leftmostNode === node
            )
          ) {
            return group(parts);
          }
        }
      }
      return parts;

    case "ExportDefaultDeclaration":
    case "ExportNamedDeclaration":
    case "ExportAllDeclaration":
      return printExportDeclaration(path, options, print);
    case "ImportDeclaration":
      return printImportDeclaration(path, options, print);
    case "ImportSpecifier":
    case "ExportSpecifier":
    case "ImportNamespaceSpecifier":
    case "ExportNamespaceSpecifier":
    case "ImportDefaultSpecifier":
    case "ExportDefaultSpecifier":
      return printModuleSpecifier(path, options, print);
    case "ImportAttribute":
      return [print("key"), ": ", print("value")];
    case "Import":
      return "import";
    case "BlockStatement":
    case "StaticBlock":
      return printBlock(path, options, print);
    case "ClassBody":
      return printClassBody(path, options, print);
    case "ThrowStatement":
      return printThrowStatement(path, options, print);
    case "ReturnStatement":
      return printReturnStatement(path, options, print);
    case "NewExpression":
    case "ImportExpression":
    case "OptionalCallExpression":
    case "CallExpression":
      return printCallExpression(path, options, print);

    case "ObjectExpression":
    case "ObjectPattern":
    case "RecordExpression":
      return printObject(path, options, print);
    // Babel 6
    case "ObjectProperty": // Non-standard AST node type.
    case "Property":
      if (node.method || node.kind === "get" || node.kind === "set") {
        return printMethod(path, options, print);
      }
      return printProperty(path, options, print);
    case "ObjectMethod":
      return printMethod(path, options, print);
    case "Decorator":
      return ["@", print("expression")];
    case "ArrayExpression":
    case "ArrayPattern":
    case "TupleExpression":
      return printArray(path, options, print);
    case "SequenceExpression": {
      const { parent } = path;
      if (
        parent.type === "ExpressionStatement" ||
        parent.type === "ForStatement"
      ) {
        // For ExpressionStatements and for-loop heads, which are among
        // the few places a SequenceExpression appears unparenthesized, we want
        // to indent expressions after the first.
        const parts = [];
        path.each(({ isFirst }) => {
          if (isFirst) {
            parts.push(print());
          } else {
            parts.push(",", indent([line, print()]));
          }
        }, "expressions");
        return group(parts);
      }
      return group(join([",", line], path.map(print, "expressions")));
    }
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "Directive":
      return [print("value"), semi]; // Babel 6
    case "UnaryExpression":
      parts.push(node.operator);

      if (/[a-z]$/.test(node.operator)) {
        parts.push(" ");
      }

      if (hasComment(node.argument)) {
        parts.push(
          group(["(", indent([softline, print("argument")]), softline, ")"])
        );
      } else {
        parts.push(print("argument"));
      }

      return parts;
    case "UpdateExpression":
      parts.push(print("argument"), node.operator);

      if (node.prefix) {
        parts.reverse();
      }

      return parts;
    case "ConditionalExpression":
      return printTernary(path, options, print);
    case "VariableDeclaration": {
      const printed = path.map(print, "declarations");

      // We generally want to terminate all variable declarations with a
      // semicolon, except when they in the () part of for loops.
      const parentNode = path.parent;

      const isParentForLoop =
        parentNode.type === "ForStatement" ||
        parentNode.type === "ForInStatement" ||
        parentNode.type === "ForOfStatement";

      const hasValue = node.declarations.some((decl) => decl.init);

      let firstVariable;
      if (printed.length === 1 && !hasComment(node.declarations[0])) {
        firstVariable = printed[0];
      } else if (printed.length > 0) {
        // Indent first var to comply with eslint one-var rule
        firstVariable = indent(printed[0]);
      }

      parts = [
        printDeclareToken(path),
        node.kind,
        firstVariable ? [" ", firstVariable] : "",
        indent(
          printed
            .slice(1)
            .map((p) => [
              ",",
              hasValue && !isParentForLoop ? hardline : line,
              p,
            ])
        ),
      ];

      if (!(isParentForLoop && parentNode.body !== node)) {
        parts.push(semi);
      }

      return group(parts);
    }
    case "WithStatement":
      return group([
        "with (",
        print("object"),
        ")",
        adjustClause(node.body, print("body")),
      ]);
    case "IfStatement": {
      const con = adjustClause(node.consequent, print("consequent"));
      const opening = group([
        "if (",
        group([indent([softline, print("test")]), softline]),
        ")",
        con,
      ]);

      parts.push(opening);

      if (node.alternate) {
        const commentOnOwnLine =
          hasComment(
            node.consequent,
            CommentCheckFlags.Trailing | CommentCheckFlags.Line
          ) || needsHardlineAfterDanglingComment(node);
        const elseOnSameLine =
          node.consequent.type === "BlockStatement" && !commentOnOwnLine;
        parts.push(elseOnSameLine ? " " : hardline);

        if (hasComment(node, CommentCheckFlags.Dangling)) {
          parts.push(
            printDanglingComments(path, options),
            commentOnOwnLine ? hardline : " "
          );
        }

        parts.push(
          "else",
          group(
            adjustClause(
              node.alternate,
              print("alternate"),
              node.alternate.type === "IfStatement"
            )
          )
        );
      }

      return parts;
    }
    case "ForStatement": {
      const body = adjustClause(node.body, print("body"));

      // We want to keep dangling comments above the loop to stay consistent.
      // Any comment positioned between the for statement and the parentheses
      // is going to be printed before the statement.
      const dangling = printDanglingComments(path, options);
      const printedComments = dangling ? [dangling, softline] : "";

      if (!node.init && !node.test && !node.update) {
        return [printedComments, group(["for (;;)", body])];
      }

      return [
        printedComments,
        group([
          "for (",
          group([
            indent([
              softline,
              print("init"),
              ";",
              line,
              print("test"),
              ";",
              line,
              print("update"),
            ]),
            softline,
          ]),
          ")",
          body,
        ]),
      ];
    }
    case "WhileStatement":
      return group([
        "while (",
        group([indent([softline, print("test")]), softline]),
        ")",
        adjustClause(node.body, print("body")),
      ]);
    case "ForInStatement":
      return group([
        "for (",
        print("left"),
        " in ",
        print("right"),
        ")",
        adjustClause(node.body, print("body")),
      ]);

    case "ForOfStatement":
      return group([
        "for",
        node.await ? " await" : "",
        " (",
        print("left"),
        " of ",
        print("right"),
        ")",
        adjustClause(node.body, print("body")),
      ]);

    case "DoWhileStatement": {
      const clause = adjustClause(node.body, print("body"));
      const doBody = group(["do", clause]);
      parts = [doBody];

      if (node.body.type === "BlockStatement") {
        parts.push(" ");
      } else {
        parts.push(hardline);
      }
      parts.push(
        "while (",
        group([indent([softline, print("test")]), softline]),
        ")",
        semi
      );

      return parts;
    }
    case "DoExpression":
      return [node.async ? "async " : "", "do ", print("body")];
    case "BreakStatement":
    case "ContinueStatement":
      parts.push(node.type === "BreakStatement" ? "break" : "continue");

      if (node.label) {
        parts.push(" ", print("label"));
      }

      parts.push(semi);

      return parts;
    case "LabeledStatement":
      if (node.body.type === "EmptyStatement") {
        return [print("label"), ":;"];
      }

      return [print("label"), ": ", print("body")];
    case "TryStatement":
      return [
        "try ",
        print("block"),
        node.handler ? [" ", print("handler")] : "",
        node.finalizer ? [" finally ", print("finalizer")] : "",
      ];
    case "CatchClause":
      if (node.param) {
        const parameterHasComments = hasComment(
          node.param,
          (comment) =>
            !isBlockComment(comment) ||
            (comment.leading &&
              hasNewline(options.originalText, locEnd(comment))) ||
            (comment.trailing &&
              hasNewline(options.originalText, locStart(comment), {
                backwards: true,
              }))
        );
        const param = print("param");

        return [
          "catch ",
          parameterHasComments
            ? ["(", indent([softline, param]), softline, ") "]
            : ["(", param, ") "],
          print("body"),
        ];
      }

      return ["catch ", print("body")];
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return [
        group([
          "switch (",
          indent([softline, print("discriminant")]),
          softline,
          ")",
        ]),
        " {",
        node.cases.length > 0
          ? indent([
              hardline,
              join(
                hardline,
                path.map(
                  ({ node, isLast }) => [
                    print(),
                    !isLast && isNextLineEmpty(node, options) ? hardline : "",
                  ],
                  "cases"
                )
              ),
            ])
          : "",
        hardline,
        "}",
      ];
    case "SwitchCase": {
      if (node.test) {
        parts.push("case ", print("test"), ":");
      } else {
        parts.push("default:");
      }

      if (hasComment(node, CommentCheckFlags.Dangling)) {
        parts.push(" ", printDanglingComments(path, options));
      }

      const consequent = node.consequent.filter(
        (node) => node.type !== "EmptyStatement"
      );

      if (consequent.length > 0) {
        const cons = printStatementSequence(path, options, print, "consequent");

        parts.push(
          consequent.length === 1 && consequent[0].type === "BlockStatement"
            ? [" ", cons]
            : indent([hardline, cons])
        );
      }

      return parts;
    }
    // JSX extensions below.
    case "DebuggerStatement":
      return ["debugger", semi];

    case "ClassDeclaration":
    case "ClassExpression":
      return printClass(path, options, print);
    case "ClassMethod":
    case "ClassPrivateMethod":
    case "MethodDefinition":
      return printClassMethod(path, options, print);
    case "ClassProperty":
    case "PropertyDefinition":
    case "ClassPrivateProperty":
    case "ClassAccessorProperty":
    case "AccessorProperty":
      return printClassProperty(path, options, print);
    case "TemplateElement":
      return replaceEndOfLine(node.value.raw);
    case "TemplateLiteral":
      return printTemplateLiteral(path, print, options);
    case "TaggedTemplateExpression":
      return printTaggedTemplateLiteral(print);
    case "PrivateIdentifier":
      return ["#", node.name];
    case "PrivateName":
      return ["#", print("id")];

    // For hack-style pipeline
    case "TopicReference":
      return "%";

    case "ArgumentPlaceholder":
      return "?";

    case "ModuleExpression": {
      parts.push("module {");
      const printed = print("body");
      if (printed) {
        parts.push(indent([hardline, printed]), hardline);
      }
      parts.push("}");
      return parts;
    }

    case "InterpreterDirective": // Printed as comment
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "ESTree");
  }
}

export const experimentalFeatures = {
  // TODO: Make this default behavior
  avoidAstMutation: true,
};
export { genericPrint as print };
export * from "./comments/printer-methods.js";
export { default as embed } from "./embed/index.js";
export { default as massageAstNode } from "./clean.js";
export { insertPragma } from "./pragma.js";
export { default as getVisitorKeys } from "./traverse/get-visitor-keys.js";
