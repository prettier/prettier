import {
  dedent,
  fill,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../document/builders.js";
import { DOC_TYPE_GROUP, DOC_TYPE_INDENT } from "../document/constants.js";
import { getDocType, removeLines } from "../document/utils.js";
import { assertDocArray } from "../document/utils/assert-doc.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import printString from "../utils/print-string.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd } from "./loc.js";
import { insertPragma } from "./pragma.js";
import { printCssNumber, printTrailingComma, printUnit } from "./print/misc.js";
import printSequence from "./print/sequence.js";
import { chunk } from "./utils/chunk.js";
import {
  hasComposesNode,
  hasParensAroundNode,
  insideICSSRuleNode,
  isDetachedRulesetCallNode,
  isDetachedRulesetDeclarationNode,
  isInMap,
  isKeyValuePairNode,
  isSCSSControlDirectiveNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isWideKeywords,
  lastLineHasInlineComment,
  maybeToLowerCase,
  serializeMemberList,
  shouldBreakList,
} from "./utils/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.sassType) {
    case "front-matter":
      return [node.raw, hardline];

    case "root": {
      const nodes = printSequence(path, options, print);
      let after = node.raws.after?.trim() ?? "";
      if (after.startsWith(";")) {
        after = after.slice(1).trim();
      }

      return [
        node.frontMatter ? [print("frontMatter"), hardline] : "",
        nodes,
        after ? ` ${after}` : "",
        node.nodes.length > 0 ? hardline : "",
      ];
    }

    case "sass-comment":
    case "comment":
      // TODO: This strips trailing newlines
      return node.toString().trim();

    case "rule":
      return [
        // TODO: Replace this once sass-parser exposes parsed selector node
        // print("selector"),
        node.selector.trim(),
        node.nodes
          ? [
              node.selector ? " " : "",
              "{",
              node.nodes.length > 0
                ? indent([hardline, printSequence(path, options, print)])
                : "",
              hardline,
              "}",
              isDetachedRulesetDeclarationNode(node) ? ";" : "",
            ]
          : ";",
      ];

    case "variable-declaration":
    case "decl": {
      const parentNode = path.parent;
      const { between: rawBetween } = node.raws;
      const trimmedBetween = rawBetween?.trim() ?? ":";
      const isColon = trimmedBetween === ":";
      const isValueAllSpace =
        node.expression === undefined && /^ *$/u.test(node.value);
      let value = node.expression ? print("expression") : node.value;

      value = hasComposesNode(node) ? removeLines(value) : value;

      if (
        !isColon &&
        lastLineHasInlineComment(trimmedBetween) &&
        !(
          node.expression &&
          path.call(() => shouldBreakList(path), "expression")
        )
      ) {
        value = indent([hardline, dedent(value)]);
      }

      return [
        node.raws.before?.replaceAll(/[\s;]/gu, "") ?? "",
        insideICSSRuleNode(path) ? node.prop : maybeToLowerCase(node.prop),
        trimmedBetween.startsWith("//") ? " " : "",
        trimmedBetween,
        isValueAllSpace ? "" : " ",
        value,
        // TODO: using `node.important` throws an error, not yet implemented
        // node.raws.important
        //   ? node.raws.important.replace(/\s*!\s*important/iu, " !important")
        //   : node.important
        //     ? " !important"
        //     : "",
        node.guarded ? " !default" : "",
        node.global ? " !global" : "",
        node.nodes
          ? [
              " {",
              indent([softline, printSequence(path, options, print)]),
              softline,
              "}",
            ]
          : // TODO: Handle `@prettier-placeholder`
            // https://github.com/prettier/prettier/issues/6790
            isTemplatePropNode(node) &&
              !parentNode.raws.semicolon &&
              options.originalText[locEnd(node) - 1] !== ";"
            ? ""
            : options.__isHTMLStyleAttribute && path.isLast
              ? ifBreak(";")
              : ";",
      ];
    }

    case "content-rule":
    case "debug-rule":
    case "each-rule":
    case "else-rule":
    case "error-rule":
    case "for-rule":
    case "forward-rule":
    case "function-rule":
    case "if-rule":
    case "import-rule":
    case "include-rule":
    case "mixin-rule":
    case "return-rule":
    case "use-rule":
    case "warn-rule":
    case "while-rule":
    case "atrule": {
      const parentNode = path.parent;
      const isTemplatePlaceholderNodeWithoutSemiColon =
        isTemplatePlaceholderNode(node) &&
        !parentNode.raws.semicolon &&
        options.originalText[locEnd(node) - 1] !== ";";
      const nameKey = `${node.sassType.split("-")[0]}Name`;

      const params = [];
      let child;
      switch (node.sassType) {
        case "content-rule":
          if (
            node.raws.showArguments ||
            isNonEmptyArray(node.contentArguments)
          ) {
            params.push("contentArguments");
            child = node.contentArguments;
          }
          break;
        case "debug-rule":
          params.push(" ", print("debugExpression"));
          child = node.debugExpression;
          break;
        case "each-rule":
          if (isNonEmptyArray(node.variables) && node.eachExpression) {
            params.push(
              " ",
              group([
                join(
                  [",", line],
                  node.variables.map(
                    (variable, index) =>
                      `$${variable}${node.raws.afterVariables?.[index] ?? ""}`,
                  ),
                ),
                indent([line, "in", node.raws.afterIn ?? " "]),
              ]),
              print("eachExpression"),
            );
            child = node.eachExpression;
          }
          break;
        case "else-rule":
          if (node.elseCondition) {
            params.push(
              group([" if", node.raws.afterIf ?? line, print("elseCondition")]),
            );
            child = node.elseCondition;
          }
          break;
        case "error-rule":
          params.push(" ", print("errorExpression"));
          child = node.errorExpression;
          break;
        case "for-rule":
          params.push(
            " ",
            group([
              `$${node.variable}`,
              node.raws.afterVariable ?? line,
              "from",
              node.raws.afterFrom ?? " ",
              print("fromExpression"),
              node.raws.afterFromExpression ?? line,
              node.to,
              node.raws.afterTo ?? " ",
              print("toExpression"),
            ]),
          );
          break;
        case "forward-rule":
          params.push(
            " ",
            node.raws.url?.value === node.forwardUrl
              ? node.raws.url.raw
              : printString('"' + node.forwardUrl + '"', options),
            node.raws.prefix?.value === node.prefix
              ? node.raws.prefix.raw
              : node.prefix
                ? " as " + node.prefix + "*"
                : "",
            node.show
              ? serializeMemberList("show", node.show, node.raws.show)
              : node.hide
                ? serializeMemberList("hide", node.hide, node.raws.hide)
                : "",
          );
          if (node.configuration.size > 0) {
            params.push(
              `${node.raws.beforeWith ?? " "}with`,
              `${node.raws.afterWith ?? " "}`,
              print("configuration"),
            );
          }
          break;
        case "function-rule":
          params.push(print("parameters"));
          child = node.parameters;
          break;
        case "if-rule":
          params.push(" ", print("ifCondition"));
          child = node.ifCondition;
          break;
        case "import-rule":
          if (isNonEmptyArray(node.imports.nodes)) {
            params.push(" ", print("imports"));
            child = node.imports;
          }
          break;
        case "include-rule":
          if (
            node.raws.showArguments ||
            isNonEmptyArray(node.arguments.nodes)
          ) {
            params.push(print("arguments"));
            child = node.arguments;
          }
          if (node.using) {
            params.push(
              node.raws.afterArguments ?? line,
              "using",
              node.raws.afterUsing ?? " ",
              print("using"),
            );
            child = node.using;
          }
          break;
        case "mixin-rule":
          params.push(print("parameters"));
          child = node.parameters;
          break;
        case "return-rule":
          if (node.returnExpression) {
            params.push(line, print("returnExpression"));
            child = node.returnExpression;
          }
          break;
        case "use-rule":
          params.push(
            " ",
            node.raws.url?.value === node.useUrl
              ? node.raws.url.raw
              : printString('"' + node.useUrl + '"', options),
            node.raws.namespace?.value === node.namespace
              ? node.raws.namespace.raw
              : !node.namespace
                ? " as *"
                : node.defaultNamespace !== node.namespace
                  ? " as " + node.namespace
                  : "",
          );
          if (node.configuration.size > 0) {
            params.push(
              `${node.raws.beforeWith ?? " "}with`,
              `${node.raws.afterWith ?? " "}`,
              print("configuration"),
            );
          }
          break;
        case "warn-rule":
          params.push(" ", print("warnExpression"));
          child = node.warnExpression;
          break;
        case "while-rule":
          params.push(" ", print("whileCondition"));
          child = node.whileCondition;
          break;
      }

      return [
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as at-rules with params starting
        // with a colon, so keep the original case then.
        isDetachedRulesetCallNode(node) ||
        node.params.startsWith(": ") ||
        isTemplatePlaceholderNode(node)
          ? node.name
          : maybeToLowerCase(node.name),
        node[nameKey]
          ? [
              " ",
              node.namespace
                ? node.raws.namespace?.value === node.namespace
                  ? node.raws.namespace.raw
                  : node.namespace + "."
                : "",
              node.raws[nameKey]?.value === node[nameKey]
                ? node.raws[nameKey].raw
                : node[nameKey],
            ]
          : "",
        // TODO: Should `@extend` at-rules have a parsed "selector"?
        // node.selector ? indent([" ", print("selector")]) : "",
        // Known Sass-specific at-rules have parsed parameters in `nameKey`
        node.sassType !== "atrule" && isNonEmptyArray(params)
          ? isSCSSControlDirectiveNode(node)
            ? group([
                child?.sassType === "parenthesized" ? params : indent(params),
                child && hasParensAroundNode(child) ? " " : line,
              ])
            : group(params)
          : node.sassType === "else-rule"
            ? " "
            : "",
        // Generic CSS at-rules do not have parsed parameters
        node.sassType === "atrule" && node.params
          ? [
              isDetachedRulesetCallNode(node)
                ? ""
                : isTemplatePlaceholderNode(node)
                  ? node.raws.afterName === ""
                    ? ""
                    : node.params.startsWith(": ")
                      ? ""
                      : /^\s*\n\s*\n/u.test(node.raws.afterName)
                        ? [hardline, hardline]
                        : /^\s*\n/u.test(node.raws.afterName)
                          ? hardline
                          : " "
                  : node.params.startsWith(": ")
                    ? ""
                    : " ",
              node.params.trim(),
            ]
          : "",
        node.nodes
          ? [
              isSCSSControlDirectiveNode(node)
                ? ""
                : // TODO: Should `@extend` at-rules have a parsed "selector"?
                  (node.selector &&
                      !node.selector.nodes &&
                      typeof node.selector.value === "string" &&
                      lastLineHasInlineComment(node.selector.value)) ||
                    (!node.selector && lastLineHasInlineComment(node.params))
                  ? line
                  : " ",
              "{",
              indent([
                node.nodes.length > 0 ? softline : "",
                printSequence(path, options, print),
              ]),
              softline,
              "}",
            ]
          : isTemplatePlaceholderNodeWithoutSemiColon
            ? ""
            : ";",
      ];
    }

    case "configured-variable": {
      const between = node.raws.between ?? [
        ":",
        hasParensAroundNode(node.expression) ? " " : line,
      ];
      return group(
        indent([
          "$",
          node.raws.name?.value === node.name ? node.raws.name.raw : node.name,
          between,
          print("expression"),
          node.guarded ? [node.raws.beforeGuard ?? " ", "!default"] : "",
        ]),
      );
    }

    case "function-call":
      return [
        node.namespace
          ? (node.raws.namespace?.value === node.namespace
              ? node.raws.namespace.raw
              : node.namespace) + "."
          : "",
        node.raws.name?.value === node.name ? node.raws.name.raw : node.name,
        print("arguments"),
      ];

    case "parameter":
    case "argument":
      return group([
        node.name === undefined
          ? ""
          : [
              "$",
              node.raws.name?.value === node.name
                ? node.raws.name.raw
                : node.name,
              node.sassType !== "parameter" || node.defaultValue
                ? (node.raws.between ?? ":")
                : "",
            ],
        node.defaultValue
          ? [
              hasParensAroundNode(node.defaultValue) ? " " : line,
              print("defaultValue"),
            ]
          : "",
        node.value
          ? node.name === undefined
            ? print("value")
            : hasParensAroundNode(node.value)
              ? [" ", print("value")]
              : indent([line, print("value")])
          : "",
        node.rest ? (node.raws.beforeRest ?? "") + "..." : "",
      ]);

    case "map-entry": {
      const keyDoc = print("key");
      let valueDoc = print("value");
      const between = node.raws.between ?? [
        ":",
        hasParensAroundNode(node.key) || hasParensAroundNode(node.value)
          ? " "
          : line,
      ];
      if (hasParensAroundNode(node.key) && hasParensAroundNode(node.value)) {
        valueDoc = indent(valueDoc);
      }
      return group(indent([keyDoc, between, valueDoc]));
    }

    case "import-list":
      return group(indent([join([",", line], path.map(print, "nodes"))]));

    case "static-import":
      return group([
        print("staticUrl"),
        node.modifiers ? [node.raws.between ?? " ", print("modifiers")] : "",
      ]);

    case "dynamic-import":
      return group([
        node.raws.url?.value === node.url
          ? node.raws.url.raw
          : printString('"' + node.url + '"', options),
      ]);

    case "interpolation": {
      const rawText = node.raws?.text;
      const rawExpressions = node.raws?.expressions;
      return path.map(({ node, index }) => {
        if (typeof node === "string") {
          const raw = rawText?.[index];
          return raw?.value === node ? raw.raw : node;
        }
        const raw = rawExpressions?.[index];
        // TODO: This seems like a bug in sass-parser.
        // Interpolated function calls should not be wrapped in `#{...}`:
        // https://github.com/sass/dart-sass/blob/main/pkg/sass-parser/lib/src/interpolation.ts#L307-L324
        return [
          node.sassType !== "interpolated-function-call" ? "#{" : "",
          raw?.before ?? "",
          print(),
          raw?.after ?? "",
          node.sassType !== "interpolated-function-call" ? "}" : "",
        ];
      }, "nodes");
    }

    case "map":
    case "parameter-list":
    case "argument-list":
    case "list":
    case "configuration": {
      const parentNode = path.parent;

      if (node.sassType === "configuration") {
        node.nodes = [...node.variables()];
      }

      const nodeDocs = path.map(
        ({ node }) => (typeof node === "string" ? node : print()),
        "nodes",
      );

      const isList = node.sassType === "list";
      const isNestedList = Boolean(
        isList && path.findAncestor((node) => node.sassType === "list"),
      );

      let separator = ",";
      if (isList) {
        switch (node.separator) {
          case "/":
            separator = " /";
            break;
          case ",":
            separator = ",";
            break;
          default:
            separator = "";
        }
      }

      // Handle lists without parentheses
      if (isList && parentNode.sassType !== "parenthesized") {
        // Handle empty lists
        if (node.nodes.length === 0) {
          return [node.brackets ? "[]" : "()"];
        }
        const forceHardLine = shouldBreakList(path);
        assertDocArray(nodeDocs);
        const isDirectChildOfEachRule = parentNode.sassType === "each-rule";
        const docs =
          isDirectChildOfEachRule && nodeDocs.length > 1
            ? nodeDocs.slice(1)
            : nodeDocs;
        const withSeparator = chunk(join(separator, docs), 2);
        const parts = join(forceHardLine ? hardline : line, withSeparator);
        const doc = forceHardLine
          ? [hardline, parts]
          : group([parentNode.type === "decl" ? softline : "", fill(parts)]);
        const openBracket = node.brackets
          ? "[" + (node.raws?.afterOpen ?? "")
          : "";
        const closeBracket = node.brackets
          ? "]" + (node.raws?.beforeClose ?? "")
          : "";
        const shouldBreak = isNestedList;
        if (isDirectChildOfEachRule) {
          return group(
            [
              openBracket,
              nodeDocs[0],
              separator,
              forceHardLine ? hardline : line,
              doc,
              closeBracket,
            ],
            { shouldBreak },
          );
        }
        return group([openBracket, indent(doc), closeBracket], {
          shouldBreak,
        });
      }

      // Handle parenthesized lists/maps/arguments
      const parts = path.map(({ node: child, isLast, index }) => {
        let doc = nodeDocs[index];

        // Key/Value pair in open paren - check if it needs dedenting
        // This handles cases like (key: (nested, values)) where the nested part
        // is already indented and we need to dedent to align properly
        if (isKeyValuePairNode(child)) {
          const value =
            child.sassType === "configured-variable"
              ? child.expression
              : child.value;
          if (
            ((value && hasParensAroundNode(value)) ||
              (child.key && hasParensAroundNode(child.key))) &&
            getDocType(doc) === DOC_TYPE_GROUP &&
            getDocType(doc.contents) === DOC_TYPE_INDENT
          ) {
            doc = group(dedent(doc));
          }
        }
        const parts = [
          doc,
          isLast && separator === ","
            ? printTrailingComma(path, options)
            : separator,
        ];

        // TODO: Is this still needed?
        // if (
        //   !isLast &&
        //   isCommaGroup(child) &&
        //   child.source &&
        //   isNextLineEmpty(options.originalText, locEnd(child))
        // ) {
        //   parts.push(hardline);
        // }

        return parts;
      }, "nodes");

      const { isKey, isValue } = isInMap(path);
      const isInConfiguration = Boolean(
        node.sassType === "configuration" ||
          path.findAncestor((node) => node.sassType === "configuration"),
      );
      const hasParens = parentNode.sassType === "parenthesized";
      const isSCSSMap = node.sassType === "map";
      const isInEachRule = Boolean(
        path.findAncestor((node) => node.sassType === "each-rule"),
      );
      const shouldBreak =
        isInConfiguration ||
        isNestedList ||
        ((isSCSSMap || isValue) && !isKey && !isInEachRule);
      // const shouldDedent =
      //   isInConfiguration || isKey || isInEachRule || isValue;
      const doc = hasParens
        ? group(join(line, parts), { shouldBreak })
        : group(["(", indent([softline, join(line, parts)]), softline, ")"], {
            shouldBreak,
          });

      return isInEachRule ? dedent(doc) : doc;
    }

    case "number": {
      const unit = printUnit(node.unit ?? "");
      return [
        printCssNumber(
          // TODO: This doesn't seem to be implemented in sass-parser
          node.raws?.value?.value === node.value
            ? node.raws.value.raw
            : node.value.toString(),
        ),
        unit,
      ];
    }

    case "color": {
      const text = node.value.toString();
      if (/^#.+/u.test(text)) {
        return text.toLowerCase();
      }
      return text;
    }

    case "binary-operation": {
      const leftDoc = print("left");
      const rightDoc = print("right");
      const { operator } = node;
      const beforeOperator = node.raws.beforeOperator ?? " ";
      const afterOperator = node.raws.afterOperator ?? " ";

      // For binary operations, determine if we need extra indentation
      // Extra indentation is needed when we're nested inside other constructs like parentheses
      const needsExtraIndent = path.parent.sassType === "parenthesized";

      const parts = [
        leftDoc,
        beforeOperator,
        operator,
        afterOperator === " "
          ? needsExtraIndent
            ? indent(line)
            : line
          : afterOperator,
        rightDoc,
      ];

      // Only group the outermost binary operation
      // This ensures all operations in a chain break together
      const parentIsBinaryOp = path.parent.sassType === "binary-operation";
      return parentIsBinaryOp ? parts : group(indent(parts));
    }

    case "parenthesized": {
      const shouldBreak =
        path.parent.sassType === "map-entry" && path.parent.value === node;
      const doc = ["(", indent([softline, print("inParens")]), softline, ")"];
      return group(doc, { shouldBreak });
    }

    case "selector-expr":
      return "&";

    case "variable":
      return [
        node.namespace
          ? (node.raws.namespace?.value === node.namespace
              ? node.raws.namespace.raw
              : node.namespace) + "."
          : "",
        "$" +
          (node.raws.variableName?.value === node.variableName
            ? node.raws.variableName.raw
            : node.variableName),
      ];

    case "boolean":
      return node.value.toString();

    case "null":
      return "null";

    case "string": {
      let text = node.toString().trim();
      if (node.quotes) {
        text = printString(text, options);
      } else if (isWideKeywords(text)) {
        text = text.toLowerCase();
      }
      // TODO: Single-entry lists are parsed as strings, e.g. ('list')
      // if (
      //   node.parent.sassType === "parenthesized" &&
      //   shouldPrintTrailingComma(options)
      // ) {
      //   text += ",";
      // }
      return text;
    }

    case "unary-operation":
      return group([
        node.operator,
        node.raws.between ??
          (node.operator === "not" ||
          (node.operator === "-" &&
            ((node.operand.sassType === "string" && !node.operand.quotes) ||
              node.operand.sassType === "function-call" ||
              node.operand.sassType === "interpolated-function-call")) ||
          node.operand.sassType === "number"
            ? " "
            : ""),
        print("operand"),
      ]);

    case "interpolated-function-call":
      return group([print("name"), print("arguments")]);

    case "unknown":
      return node.value;

    default:
      /* c8 ignore next */
      console.error(node.toJSON());
      throw new UnexpectedNodeError(node, "PostCSS", "sassType");
  }
}

const printer = {
  print: genericPrint,
  embed,
  insertPragma,
  getVisitorKeys,
};

export default printer;
