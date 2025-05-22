import {
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../../document/builders.js";
import { replaceEndOfLine } from "../../document/utils.js";
import { printDanglingComments } from "../../main/comments/print.js";
import hasNewline from "../../utils/has-newline.js";
import UnexpectedNodeError from "../../utils/unexpected-node-error.js";
import { locEnd, locStart } from "../loc.js";
import {
  CommentCheckFlags,
  hasComment,
  isArrayExpression,
  isCallExpression,
  isLiteral,
  isMemberExpression,
  isMethod,
  isNextLineEmpty,
  isObjectExpression,
  needsHardlineAfterDanglingComment,
  startsWithNoLookaheadToken,
} from "../utils/index.js";
import isBlockComment from "../utils/is-block-comment.js";
import { printArray } from "./array.js";
import { printArrowFunction } from "./arrow-function.js";
import {
  printAssignmentExpression,
  printVariableDeclarator,
} from "./assignment.js";
import { printBinaryishExpression } from "./binaryish.js";
import { printBlock } from "./block.js";
import { printCallExpression } from "./call-expression.js";
import {
  printClass,
  printClassBody,
  printClassMethod,
  printClassProperty,
} from "./class.js";
import { printExpressionStatement } from "./expression-statement.js";
import {
  printFunction,
  printMethod,
  printReturnStatement,
  printThrowStatement,
} from "./function.js";
import { printHtmlBinding } from "./html-binding.js";
import { printLiteral } from "./literal.js";
import { printMemberExpression } from "./member.js";
import {
  adjustClause,
  printBindExpressionCallee,
  printDeclareToken,
  printDefiniteToken,
  printOptionalToken,
  printRestSpread,
} from "./misc.js";
import {
  printExportDeclaration,
  printImportDeclaration,
  printModuleSpecifier,
} from "./module.js";
import { printObject } from "./object.js";
import { printProperty } from "./property.js";
import { printStatementSequence } from "./statement.js";
import {
  printTaggedTemplateLiteral,
  printTemplateLiteral,
} from "./template-literal.js";
import { printTernary } from "./ternary.js";
import { printTypeAnnotationProperty } from "./type-annotation.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/builders.js"
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

  const semi = options.semi ? ";" : "";
  /** @type{Doc[]} */
  let parts = [];

  switch (node.type) {
    case "JsExpressionRoot":
      return print("node");
    case "JsonRoot":
      return [printDanglingComments(path, options), print("node"), hardline];
    case "File":
      return printHtmlBinding(path, options, print) ?? print("program");
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
      if (node.object) {
        parts.push(print("object"));
      }

      parts.push(
        group(
          indent([softline, printBindExpressionCallee(path, options, print)]),
        ),
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
      return printFunction(path, options, print, args);
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
              node.type === "AwaitExpression" || node.type === "BlockStatement",
          );
          if (
            parentAwaitOrBlock?.type !== "AwaitExpression" ||
            !startsWithNoLookaheadToken(
              parentAwaitOrBlock.argument,
              (leftmostNode) => leftmostNode === node,
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

      const parts = join([",", line], path.map(print, "expressions"));

      if (
        ((parent.type === "ReturnStatement" ||
          parent.type === "ThrowStatement") &&
          path.key === "argument") ||
        (parent.type === "ArrowFunctionExpression" && path.key === "body")
      ) {
        return group(ifBreak([indent([softline, parts]), softline], parts));
      }

      return group(parts);
    }
    case "ThisExpression":
      return "this";
    case "Super":
      return "super";
    case "Directive":
      return [print("value"), semi]; // Babel 6
    case "UnaryExpression":
      parts.push(node.operator);

      if (/[a-z]$/u.test(node.operator)) {
        parts.push(" ");
      }

      if (hasComment(node.argument)) {
        parts.push(
          group(["(", indent([softline, print("argument")]), softline, ")"]),
        );
      } else {
        parts.push(print("argument"));
      }

      return parts;
    case "UpdateExpression":
      return [
        node.prefix ? node.operator : "",
        print("argument"),
        node.prefix ? "" : node.operator,
      ];
    case "ConditionalExpression":
      return printTernary(path, options, print, args);
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
            ]),
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
      const consequent = adjustClause(node.consequent, print("consequent"));
      const opening = group([
        "if (",
        group([indent([softline, print("test")]), softline]),
        ")",
        consequent,
      ]);

      parts.push(opening);

      if (node.alternate) {
        const commentOnOwnLine =
          hasComment(
            node.consequent,
            CommentCheckFlags.Trailing | CommentCheckFlags.Line,
          ) || needsHardlineAfterDanglingComment(node);
        const elseOnSameLine =
          node.consequent.type === "BlockStatement" && !commentOnOwnLine;
        parts.push(elseOnSameLine ? " " : hardline);

        if (hasComment(node, CommentCheckFlags.Dangling)) {
          parts.push(
            printDanglingComments(path, options),
            commentOnOwnLine ? hardline : " ",
          );
        }

        parts.push(
          "else",
          group(
            adjustClause(
              node.alternate,
              print("alternate"),
              node.alternate.type === "IfStatement",
            ),
          ),
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
        semi,
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
              })),
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
                  "cases",
                ),
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
        (node) => node.type !== "EmptyStatement",
      );

      if (consequent.length > 0) {
        const cons = printStatementSequence(path, options, print, "consequent");

        parts.push(
          consequent.length === 1 && consequent[0].type === "BlockStatement"
            ? [" ", cons]
            : indent([hardline, cons]),
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
      return printTemplateLiteral(path, options, print);
    case "TaggedTemplateExpression":
      return printTaggedTemplateLiteral(path, print);
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

    case "InterpreterDirective": // Printed as comment
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "ESTree");
  }
}

export { printEstree };
