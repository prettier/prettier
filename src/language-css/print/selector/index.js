import {
  breakParent,
  group,
  indent,
  join,
  line,
  softline,
} from "../../../document/index.js";
import isNonEmptyArray from "../../../utilities/is-non-empty-array.js";
import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { locEnd, locStart } from "../../loc.js";
import {
  lastLineHasInlineComment,
  maybeToLowerCase,
} from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";
import { printAttributeSelector } from "./attribute.js";
import { printCombinatorSelector } from "./combinator.js";
import { printSelectorRoot } from "./root.js";
import { printTagSelector } from "./tag.js";

function printSelectorNode(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "selector-root":
      return printSelectorRoot(path, options, print);

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
      return printTagSelector(path, options, print);

    case "selector-id":
      return ["#", node.value];

    case "selector-class":
      return [".", adjustNumbers(adjustStrings(node.value, options))];

    case "selector-attribute":
      return printAttributeSelector(path, options, print);

    case "selector-combinator":
      return printCombinatorSelector(path, options, print);

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
