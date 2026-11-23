import { group, hardline, join, line } from "../../../document/index.js";
import { insideAtRuleNode } from "../../utilities/index.js";

function printSelectorRoot(path, options, print) {
  const isLessVariable =
    path.parent.type === "css-atrule" && path.parent.variable;
  return group([
    !isLessVariable && insideAtRuleNode(path, "custom-selector")
      ? [
          path.findAncestor((node) => node.type === "css-atrule")
            .customSelector,
          line,
        ]
      : "",
    join(
      [
        ",",
        isLessVariable ||
        insideAtRuleNode(path, ["extend", "custom-selector", "nest"])
          ? line
          : hardline,
      ],
      path.map(print, "nodes"),
    ),
  ]);
}

export { printSelectorRoot };
