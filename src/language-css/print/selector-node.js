import {
  breakParent,
  group,
  hardline,
  indent,
  join,
  line,
  literallineWithoutBreakParent,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { locEnd, locStart } from "../loc.js";
import {
  insideAtRuleNode,
  isKeyframeAtRuleKeywords,
  isNthPseudoClassNode,
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "../utilities/index.js";
import { adjustNumbers, adjustStrings, quoteAttributeValue } from "./misc.js";

function printSelectorNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
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

    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Selector");
  }
}

export { printSelectorNode };
