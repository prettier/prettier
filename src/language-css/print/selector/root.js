import { group, hardline, join, line } from "../../../document/index.js";
import { insideAtRuleNode } from "../../utilities/index.js";

function printSelectorRoot(path, options, print) {
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
}

export { printSelectorRoot };
