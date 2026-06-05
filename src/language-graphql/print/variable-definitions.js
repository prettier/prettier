import {
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";

function printVariableDefinitions(path, print) {
  const { node } = path;
  if (!isNonEmptyArray(node.variableDefinitions)) {
    return "";
  }
  return group([
    "(",
    indent([
      softline,
      join(
        [ifBreak("", ", "), softline],
        path.map(print, "variableDefinitions"),
      ),
    ]),
    softline,
    ")",
  ]);
}

export { printVariableDefinitions };
