import {
  breakParent,
  group,
  hardline,
  indent,
  join,
  line,
  lineSuffix,
  literallineWithoutBreakParent,
  replaceEndOfLine,
  softline,
} from "../document/index.js";
import isNonEmptyArray from "../utilities/is-non-empty-array.js";
import printString from "../utilities/print-string.js";
import UnexpectedNodeError from "../utilities/unexpected-node-error.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { massageAstNode } from "./massage-ast/index.js";
import { insertPragma } from "./pragma.js";
import printCommaSeparatedValueGroup from "./print/comma-separated-value-group.js";
import { printCssNode } from "./print/css.js";
import {
  adjustNumbers,
  adjustStrings,
  printCssNumber,
  printUnit,
  quoteAttributeValue,
} from "./print/misc.js";
import { printParenthesizedValueGroup } from "./print/parenthesized-value-group.js";
import {
  insideAtRuleNode,
  insideValueFunctionNode,
  isKeyframeAtRuleKeywords,
  isMediaAndSupportsKeywords,
  isNthPseudoClassNode,
  isWideKeywords,
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "./utilities/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  if (node.type.startsWith("css-")) {
    return printCssNode(path, options, print);
  }

  switch (node.type) {
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
        adjustStrings(node.value.replaceAll(/ +/g, " "), options),
      );

    case "media-colon":
      return [node.value, " "];

    case "media-value":
      return adjustNumbers(adjustStrings(node.value, options));

    case "media-keyword":
      return adjustStrings(node.value, options);

    case "media-url":
      return adjustStrings(
        node.value.replaceAll(/^url\(\s+/gi, "url(").replaceAll(/\s+\)$/g, ")"),
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
          ? replaceEndOfLine(
              quoteAttributeValue(
                adjustStrings(node.value.trim(), options),
                options,
              ),
              literallineWithoutBreakParent,
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
        const isFirstNode =
          parentNode.type === "selector-selector" &&
          parentNode.nodes[0] === node;
        const leading = isFirstNode ? "" : line;

        // The leading `+` in An+B notation (e.g. `:nth-child(+2n)`) must stay
        // glued to the following token, a space there is invalid per spec.
        const isNthLeadingSign =
          isFirstNode &&
          node.value === "+" &&
          isNthPseudoClassNode(path.grandparent);

        return [
          leading,
          node.value,
          path.isLast || isNthLeadingSign ? "" : " ",
        ];
      }

      const leading = node.value.trimStart().startsWith("(") ? line : "";
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
      if (ruleAncestorNode?.isScssNestedProperty) {
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

    case "value-comment": {
      const text = options.originalText.slice(locStart(node), locEnd(node));
      return node.inline ? lineSuffix(text.trimEnd()) : text;
    }
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

    case "front-matter": // Handled in core
    case "value-comma": // Handled in `value-comma_group`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "PostCSS");
  }
}

const printer = {
  features: {
    experimental_frontMatterSupport: {
      massageAstNode: true,
      embed: true,
      print: true,
    },
  },
  print: genericPrint,
  embed,
  insertPragma,
  massageAstNode,
  getVisitorKeys,
};

export default printer;
