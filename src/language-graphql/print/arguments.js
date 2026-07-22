import {
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { printSequence } from "./sequence.js";

function printArguments(path, options, print) {
  const { node } = path;
  if (!isNonEmptyArray(node.arguments)) {
    return "";
  }

  return group([
    "(",
    indent([
      softline,
      join(
        [ifBreak("", ", "), softline],
        printSequence(path, options, print, "arguments"),
      ),
    ]),
    softline,
    ")",
  ]);
}

export { printArguments };
