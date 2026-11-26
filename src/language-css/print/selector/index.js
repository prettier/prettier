import {
  group,
  indent,
  line,
  replaceEndOfLine,
} from "../../../document/index.js";
import UnexpectedNodeError from "../../../utilities/unexpected-node-error.js";
import { adjustNumbers, adjustStrings } from "../misc.js";
import { printAttributeSelector } from "./attribute.js";
import { printCombinatorSelector } from "./combinator.js";
import { printPseudoSelector } from "./pseudo.js";
import { printSelectorRoot } from "./root.js";
import { printSelectorSpace } from "./space.js";
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
      const parts = path.map(() => {
        const { node: child } = path;
        const isCombinator = child.type === "selector-combinator";
        return [
          !isCombinator &&
          path.previous?.type === "selector-comment" &&
          child.spaces.before
            ? line
            : "",
          print(),
          // Descendant combinators print their own whitespace and comments.
          !(isCombinator && child.value === " ") &&
          child.rawSpaceAfter.includes("/*")
            ? printSelectorSpace(child.rawSpaceAfter.trimEnd())
            : "",
        ];
      }, "nodes");
      return group(shouldIndent ? indent(parts) : parts);
    }

    case "selector-comment":
      return replaceEndOfLine(node.value);

    case "selector-string":
      return adjustStrings(node.value, options);

    case "selector-tag":
      return printTagSelector(path /* , options, print */);

    case "selector-id":
      return ["#", node.raws?.value ?? node.value];

    case "selector-class":
      return [
        ".",
        adjustNumbers(adjustStrings(node.raws?.value ?? node.value, options)),
      ];

    case "selector-attribute":
      return printAttributeSelector(path, options /* , print */);

    case "selector-combinator":
      return printCombinatorSelector(path, options /* , print */);

    case "selector-universal":
      return printUniversalSelector(path /* , options  , print */);

    case "selector-pseudo":
      return printPseudoSelector(path, options, print);

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
