import {
  group,
  hardline,
  indent,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import { printDanglingComments } from "../../main/comments/print.js";
import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import {
  CommentCheckFlags,
  hasComment,
  isArrayExpression,
  isLiteral,
  isMeaningfulEmptyStatement,
  isMethod,
  isObjectExpression,
} from "../utilities/index.js";
import { printArray } from "./array.js";
import { printArrowFunction } from "./arrow-function.js";
import {
  printAssignmentExpression,
  printVariableDeclarator,
} from "./assignment.js";
import { printAwaitExpression } from "./await-expression.js";
import { printBinaryishExpression } from "./binaryish.js";
import { printBindExpression } from "./bind-expression.js";
import { printBlock } from "./block.js";
import { printCallExpression } from "./call-expression.js";
import {
  printClass,
  printClassBody,
  printClassMethod,
  printClassProperty,
} from "./class.js";
import { printExpressionStatement } from "./expression-statement.js";
import { printForStatement } from "./for-statement.js";
import { printFunction, printMethod } from "./function.js";
import { printHtmlBinding } from "./html-binding.js";
import { printIfStatement } from "./if-statement.js";
import { printLiteral } from "./literal.js";
import { printMemberExpression } from "./member.js";
import {
  adjustClause,
  printDefiniteToken,
  printOptionalToken,
} from "./miscellaneous.js";
import {
  printExportDeclaration,
  printImportDeclaration,
  printModuleSpecifier,
} from "./module.js";
import { printObject } from "./object.js";
import { printProperty } from "./property.js";
import { printRestElement, printSpreadElement } from "./rest-element.js";
import {
  printReturnStatement,
  printThrowStatement,
} from "./return-statement.js";
import { printSequenceExpression } from "./sequence-expression.js";
import { printSwitchCase, printSwitchStatement } from "./switch-statement.js";
import {
  printTaggedTemplateExpression,
  printTemplateLiteral,
} from "./template-literal.js";
import { printTernary } from "./ternary.js";
import { printCatchClause, printTryStatement } from "./try-statement.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";
import { printVariableDeclaration } from "./variable-declaration.js";
import {
  printDoWhileStatement,
  printWhileStatement,
} from "./while-statement.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

/**
 * @param {AstPath} path
 * @param {*} options
 * @param {*} print
 * @param {*} [args]
 * @returns {Doc}
 */
function printEstree(path, options, print, args) {
  const { node } = path;

  if (isLiteral(node)) {
    return printLiteral(path, options);
  }

  switch (node.type) {
    case "JsExpressionRoot":
      return print("node");
    case "JsonRoot":
      return [printDanglingComments(path, options), print("node"), hardline];
    // Babel extension.
    case "File":
      return printHtmlBinding(path, options, print) ?? print("program");
    case "ExpressionStatement":
      return printExpressionStatement(path, options, print);

    case "ChainExpression":
      return print("expression");

    // Babel non-standard node. Used for Closure-style type casts. See postprocess.js.
    case "ParenthesizedExpression": {
      const shouldHug =
        !hasComment(node.expression) &&
        (isObjectExpression(node.expression) ||
          isArrayExpression(node.expression));
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
      return printBindExpression(path, options, print);
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
      return printSpreadElement(path, print);
    case "RestElement":
      return printRestElement(path, print);
    case "FunctionDeclaration":
    case "FunctionExpression":
      return printFunction(path, options, print, args);
    case "ArrowFunctionExpression":
      return printArrowFunction(path, options, print, args);
    case "YieldExpression":
      return [
        `yield${node.delegate ? "*" : ""}`,
        node.argument ? [" ", print("argument")] : "",
      ];
    case "AwaitExpression":
      return printAwaitExpression(path, options, print);

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
      return printProperty(path, options, print);

    case "Program":
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
      return printObject(path, options, print);
    case "Property":
      if (isMethod(node)) {
        return printMethod(path, options, print);
      }
      return printProperty(path, options, print);
    // Babel
    case "ObjectProperty":
      return printProperty(path, options, print);
    // Babel
    case "ObjectMethod":
      return printMethod(path, options, print);
    case "Decorator":
      return ["@", print("expression")];
    case "ArrayExpression":
    case "ArrayPattern":
      return printArray(path, options, print);
    case "SequenceExpression":
      return printSequenceExpression(path, options, print);

    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "Directive":
      return [print("value"), options.semi ? ";" : ""];
    case "UnaryExpression": {
      const parts = [node.operator];

      if (/[a-z]$/u.test(node.operator)) {
        parts.push(" ");
      }

      const argumentDoc = print("argument");

      if (hasComment(node.argument)) {
        parts.push(
          group(["(", indent([softline, argumentDoc]), softline, ")"]),
        );
      } else {
        parts.push(argumentDoc);
      }

      return parts;
    }
    case "UpdateExpression":
      return [
        node.prefix ? node.operator : "",
        print("argument"),
        node.prefix ? "" : node.operator,
      ];
    case "ConditionalExpression":
      return printTernary(path, options, print, args);
    case "VariableDeclaration":
      return printVariableDeclaration(path, options, print);
    case "WithStatement":
      return group([
        "with (",
        print("object"),
        ")",
        adjustClause(node.body, print("body")),
      ]);
    case "IfStatement":
      return printIfStatement(path, options, print);
    case "ForStatement":
      return printForStatement(path, options, print);
    case "WhileStatement":
      return printWhileStatement(path, options, print);
    case "DoWhileStatement":
      return printDoWhileStatement(path, options, print);

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

    case "DoExpression":
      return [node.async ? "async " : "", "do ", print("body")];
    case "BreakStatement":
    case "ContinueStatement":
      return [
        node.type === "BreakStatement" ? "break" : "continue",
        node.label ? [" ", print("label")] : "",
        options.semi ? ";" : "",
      ];
    case "LabeledStatement":
      return [
        print("label"),
        `:${node.body.type === "EmptyStatement" && !hasComment(node.body, CommentCheckFlags.Leading) ? "" : " "}`,
        print("body"),
      ];
    case "TryStatement":
      return printTryStatement(path, options, print);
    case "CatchClause":
      return printCatchClause(path, options, print);
    // Note: ignoring n.lexical because it has no printing consequences.
    case "SwitchStatement":
      return printSwitchStatement(path, options, print);
    case "SwitchCase":
      return printSwitchCase(path, options, print);
    // JSX extensions below.
    case "DebuggerStatement":
      return ["debugger", options.semi ? ";" : ""];

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
      return printTemplateLiteral(path, options, print);
    case "TaggedTemplateExpression":
      return printTaggedTemplateExpression(path, options, print);
    case "PrivateIdentifier":
      return ["#", node.name];
    case "PrivateName":
      return ["#", print("id")];

    // For hack-style pipeline
    case "TopicReference":
      return "%";

    case "ArgumentPlaceholder":
      return "?";

    case "ModuleExpression":
      return ["module ", print("body")];

    case "VoidPattern":
      return "void";

    case "EmptyStatement":
      if (isMeaningfulEmptyStatement(path)) {
        return ";";
      }
    // Fall through
    case "InterpreterDirective": // Printed as comment
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "ESTree");
  }
}

export { printEstree };
