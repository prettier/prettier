import { hardline, indent, line } from "../../../document/index.js";
import {
  isDetachedRulesetDeclarationNode,
  lastLineHasInlineComment,
} from "../../utilities/index.js";
import printSequence from "../sequence.js";

function printCssRule(path, options, print) {
  const { node } = path;

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
}

export { printCssRule };
