import {
  group,
  indent,
  join,
  line,
  softline,
} from "../../../document/index.js";
import isNonEmptyArray from "../../../utilities/is-non-empty-array.js";
import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { maybeToLowerCase } from "../../utilities/index.js";
import { adjustNumbers, adjustStrings } from "../misc.js";
import { printAttributeSelector } from "./attribute.js";
import { printCombinatorSelector } from "./combinator.js";
import { printSelectorRoot } from "./root.js";
import { printTagSelector } from "./tag.js";
import { printUniversalSelector } from "./universal.js";
import { printUnknownSelector } from "./unknown.js";

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
      return printTagSelector(path /* , options, print */);

    case "selector-id":
      return ["#", node.value];

    case "selector-class":
      return [".", adjustNumbers(adjustStrings(node.value, options))];

    case "selector-attribute":
      return printAttributeSelector(path, options /* , print */);

    case "selector-combinator":
      return printCombinatorSelector(path, options /* , print */);

    case "selector-universal":
      return printUniversalSelector(path /* , options  , print */);

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

    case "selector-unknown":
      return printUnknownSelector(path, options /* , print */);

    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Selector");
  }
}

export { printSelectorNode };
