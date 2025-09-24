import {
  breakParent,
  dedent,
  group,
  hardline,
  ifBreak,
  indent,
  join,
  line,
  softline,
} from "../document/builders.js";
import { removeLines } from "../document/utils.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import printString from "../utils/print-string.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { insertPragma } from "./pragma.js";
import printCommaSeparatedValueGroup from "./print/comma-separated-value-group.js";
import {
  adjustNumbers,
  adjustStrings,
  printCssNumber,
  printUnit,
  quoteAttributeValue,
} from "./print/misc.js";
import {
  printParenthesizedValueGroup,
  shouldBreakList,
} from "./print/parenthesized-value-group.js";
import printSequence from "./print/sequence.js";
import {
  hasComposesNode,
  hasParensAroundNode,
  insideAtRuleNode,
  insideIcssRuleNode,
  insideValueFunctionNode,
  isDetachedRulesetCallNode,
  isDetachedRulesetDeclarationNode,
  isKeyframeAtRuleKeywords,
  isMediaAndSupportsKeywords,
  isSCSSControlDirectiveNode,
  isTemplatePlaceholderNode,
  isTemplatePropNode,
  isWideKeywords,
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "./utils/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "front-matter":
      return [node.raw, hardline];
    case "css-root": {
      const nodes = printSequence(path, options, print);
      let after = node.raws.after.trim();
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
    case "css-comment": {
      const isInlineComment = node.inline || node.raws.inline;

      const text = options.originalText.slice(locStart(node), locEnd(node));

      return isInlineComment ? text.trimEnd() : text;
    }
    case "css-rule":
      return [
        print("selector"),
        node.important ? " !important" : "",
        node.nodes
          ? [
              node.selector?.type === "selector-unknown" &&
              lastLineHasInlineComment(node.selector.value)
                ? line
                : node.selector
                  ? " "
                  : "",
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

    case "css-decl": {
      const parentNode = path.parent;

      const { between: rawBetween } = node.raws;
      const trimmedBetween = rawBetween.trim();
      const isColon = trimmedBetween === ":";
      const isValueAllSpace =
        typeof node.value === "string" && /^ *$/u.test(node.value);
      let value = typeof node.value === "string" ? node.value : print("value");

      value = hasComposesNode(node) ? removeLines(value) : value;

      if (
        !isColon &&
        lastLineHasInlineComment(trimmedBetween) &&
        !(
          node.value?.group?.group &&
          path.call(() => shouldBreakList(path), "value", "group", "group")
        )
      ) {
        value = indent([hardline, dedent(value)]);
      }

      return [
        node.raws.before.replaceAll(/[\s;]/gu, ""),
        // Less variable
        (parentNode.type === "css-atrule" && parentNode.variable) ||
        insideIcssRuleNode(path)
          ? node.prop
          : maybeToLowerCase(node.prop),
        trimmedBetween.startsWith("//") ? " " : "",
        trimmedBetween,
        node.extend || isValueAllSpace ? "" : " ",
        options.parser === "less" && node.extend && node.selector
          ? ["extend(", print("selector"), ")"]
          : "",
        value,
        node.raws.important
          ? node.raws.important.replace(/\s*!\s*important/iu, " !important")
          : node.important
            ? " !important"
            : "",
        node.raws.scssDefault
          ? node.raws.scssDefault.replace(/\s*!default/iu, " !default")
          : node.scssDefault
            ? " !default"
            : "",
        node.raws.scssGlobal
          ? node.raws.scssGlobal.replace(/\s*!global/iu, " !global")
          : node.scssGlobal
            ? " !global"
            : "",
        node.nodes
          ? [
              " {",
              indent([softline, printSequence(path, options, print)]),
              softline,
              "}",
            ]
          : isTemplatePropNode(node) &&
              !parentNode.raws.semicolon &&
              options.originalText[locEnd(node) - 1] !== ";"
            ? ""
            : options.__isHTMLStyleAttribute && path.isLast
              ? ifBreak(";")
              : ";",
      ];
    }
    case "css-atrule": {
      const parentNode = path.parent;
      const isTemplatePlaceholderNodeWithoutSemiColon =
        isTemplatePlaceholderNode(node) &&
        !parentNode.raws.semicolon &&
        options.originalText[locEnd(node) - 1] !== ";";

      if (options.parser === "less") {
        if (node.mixin) {
          return [
            print("selector"),
            node.important ? " !important" : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.function) {
          return [
            node.name,
            typeof node.params === "string" ? node.params : print("params"),
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }

        if (node.variable) {
          return [
            "@",
            node.name,
            ": ",
            node.value ? print("value") : "",
            node.raws.between.trim() ? node.raws.between.trim() + " " : "",
            node.nodes
              ? [
                  "{",
                  indent([
                    node.nodes.length > 0 ? softline : "",
                    printSequence(path, options, print),
                  ]),
                  softline,
                  "}",
                ]
              : "",
            isTemplatePlaceholderNodeWithoutSemiColon ? "" : ";",
          ];
        }
      }
      const isImportUnknownValueEndsWithSemiColon =
        node.name === "import" &&
        node.params?.type === "value-unknown" &&
        node.params.value.endsWith(";");

      return [
        "@",
        // If a Less file ends up being parsed with the SCSS parser, Less
        // variable declarations will be parsed as at-rules with names ending
        // with a colon, so keep the original case then.
        isDetachedRulesetCallNode(node) ||
        node.name.endsWith(":") ||
        isTemplatePlaceholderNode(node)
          ? node.name
          : maybeToLowerCase(node.name),
        node.params
          ? [
              isDetachedRulesetCallNode(node)
                ? ""
                : isTemplatePlaceholderNode(node)
                  ? node.raws.afterName === ""
                    ? ""
                    : node.name.endsWith(":")
                      ? " "
                      : /^\s*\n\s*\n/u.test(node.raws.afterName)
                        ? [hardline, hardline]
                        : /^\s*\n/u.test(node.raws.afterName)
                          ? hardline
                          : " "
                  : " ",
              typeof node.params === "string" ? node.params : print("params"),
            ]
          : "",
        node.selector ? indent([" ", print("selector")]) : "",
        node.value
          ? group([
              " ",
              print("value"),
              isSCSSControlDirectiveNode(node, options)
                ? hasParensAroundNode(node)
                  ? " "
                  : line
                : "",
            ])
          : node.name === "else"
            ? " "
            : "",
        node.nodes
          ? [
              isSCSSControlDirectiveNode(node, options)
                ? ""
                : (node.selector &&
                      !node.selector.nodes &&
                      typeof node.selector.value === "string" &&
                      lastLineHasInlineComment(node.selector.value)) ||
                    (!node.selector &&
                      typeof node.params === "string" &&
                      lastLineHasInlineComment(node.params))
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
          : isTemplatePlaceholderNodeWithoutSemiColon ||
              isImportUnknownValueEndsWithSemiColon
            ? ""
            : ";",
      ];
    }
    // postcss-media-query-parser
    case "media-query-list": {
      const parts = [];
      path.each(({ node }) => {
        if (node.type === "media-query" && node.value === "") {
          return;
        }
        parts.push(print());
      }, "nodes");

      return group(indent(join(line, parts)));
    }
    case "media-query":
      return [join(" ", path.map(print, "nodes")), path.isLast ? "" : ","];

    case "media-type":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-feature-expression":
      if (!node.nodes) {
        return node.value;
      }
      return ["(", ...path.map(print, "nodes"), ")"];

    case "media-feature":
      return maybeToLowerCase(
        adjustStrings(node.value.replaceAll(/ +/gu, " "), options),
      );

    case "media-colon":
      return [node.value, " "];

    case "media-value":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-keyword":
      return adjustStrings(node.value, options);

    case "media-url":
      return adjustStrings(
        node.value
          .replaceAll(/^url\(\s+/giu, "url(")
          .replaceAll(/\s+\)$/gu, ")"),
        options,
      );

    case "media-unknown":
      return node.value;

    // postcss-selector-parser
    case "selector-root":
      return group([
        insideAtRuleNode(path, "custom-selector")
          ? [
              path.findAncestor((node) => node.type === "css-atrule")
                .customSelector,
              line,
            ]
          : "",
        join(
          [
            ",",
            insideAtRuleNode(path, ["extend", "custom-selector", "nest"])
              ? line
              : hardline,
          ],
          path.map(print, "nodes"),
        ),
      ]);

    case "selector-selector": {
      const shouldIndent = node.nodes.length > 2;
      return group(
        (shouldIndent ? indent : (x) => x)(path.map(print, "nodes")),
      );
    }

    case "selector-comment":
      return node.value;

    case "selector-string":
      return adjustStrings(node.value, options);

    case "selector-tag":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        path.previous?.type === "selector-nesting"
          ? node.value
          : adjustNumbers(
              isKeyframeAtRuleKeywords(path, node.value)
                ? node.value.toLowerCase()
                : node.value,
            ),
      ];

    case "selector-id":
      return ["#", node.value];

    case "selector-class":
      return [".", adjustNumbers(adjustStrings(node.value, options))];

    case "selector-attribute":
      return [
        "[",
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.attribute.trim(),
        node.operator ?? "",
        node.value
          ? quoteAttributeValue(
              adjustStrings(node.value.trim(), options),
              options,
            )
          : "",
        node.insensitive ? " i" : "",
        "]",
      ];

    case "selector-combinator": {
      if (
        node.value === "+" ||
        node.value === ">" ||
        node.value === "~" ||
        node.value === ">>>"
      ) {
        const parentNode = path.parent;
        const leading =
          parentNode.type === "selector-selector" &&
          parentNode.nodes[0] === node
            ? ""
            : line;

        return [leading, node.value, path.isLast ? "" : " "];
      }

      const leading = node.value.trim().startsWith("(") ? line : "";
      const value =
        adjustNumbers(adjustStrings(node.value.trim(), options)) || line;

      return [leading, value];
    }
    case "selector-universal":
      return [
        node.namespace
          ? [node.namespace === true ? "" : node.namespace.trim(), "|"]
          : "",
        node.value,
      ];

    case "selector-pseudo":
      return [
        maybeToLowerCase(node.value),
        isNonEmptyArray(node.nodes)
          ? group([
              "(",
              indent([softline, join([",", line], path.map(print, "nodes"))]),
              softline,
              ")",
            ])
          : "",
      ];

    case "selector-nesting":
      return node.value;

    case "selector-unknown": {
      const ruleAncestorNode = path.findAncestor(
        (node) => node.type === "css-rule",
      );

      // Nested SCSS property
      if (ruleAncestorNode?.isSCSSNesterProperty) {
        return adjustNumbers(
          adjustStrings(maybeToLowerCase(node.value), options),
        );
      }

      // originalText has to be used for Less, see replaceQuotesInInlineComments in loc.js
      const parentNode = path.parent;
      if (parentNode.raws?.selector) {
        const start = locStart(parentNode);
        const end = start + parentNode.raws.selector.length;
        return options.originalText.slice(start, end).trim();
      }

      // Same reason above
      const grandParent = path.grandparent;
      if (
        parentNode.type === "value-paren_group" &&
        grandParent?.type === "value-func" &&
        grandParent.value === "selector"
      ) {
        const start = locEnd(parentNode.open) + 1;
        const end = locStart(parentNode.close);
        const selector = options.originalText.slice(start, end).trim();

        return lastLineHasInlineComment(selector)
          ? [breakParent, selector]
          : selector;
      }

      return node.value;
    }
    // postcss-values-parser
    case "value-value":
    case "value-root":
      return print("group");

    case "value-comment":
      return options.originalText.slice(locStart(node), locEnd(node));

    case "value-comma_group":
      return printCommaSeparatedValueGroup(path, options, print);

    case "value-paren_group":
      return printParenthesizedValueGroup(path, options, print);

    case "value-func":
      return [
        node.value,
        insideAtRuleNode(path, "supports") && isMediaAndSupportsKeywords(node)
          ? " "
          : "",
        print("group"),
      ];

    case "value-paren":
      return node.value;

    case "value-number":
      return [printCssNumber(node.value), printUnit(node.unit)];

    case "value-operator":
      return node.value;

    case "value-word":
      if ((node.isColor && node.isHex) || isWideKeywords(node.value)) {
        return node.value.toLowerCase();
      }

      return node.value;

    case "value-colon": {
      const { previous } = path;
      return group([
        node.value,
        // Don't add spaces on escaped colon `:`, e.g: grid-template-rows: [row-1-00\:00] auto;
        (typeof previous?.value === "string" &&
          previous.value.endsWith("\\")) ||
        // Don't add spaces on `:` in `url` function (i.e. `url(fbglyph: cross-outline, fig-white)`)
        insideValueFunctionNode(path, "url")
          ? ""
          : line,
      ]);
    }
    case "value-string":
      return printString(
        node.raws.quote + node.value + node.raws.quote,
        options,
      );

    case "value-atword":
      return ["@", node.value];

    case "value-unicode-range":
      return node.value;

    case "value-unknown":
      return node.value;

    case "value-comma": // Handled in `value-comma_group`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "PostCSS");
  }
}

const printer = {
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode: clean,
  getVisitorKeys,
};

export default printer;
